package ca.uoft.cs.mavo.z3solver;

import java.util.ArrayList;

import com.google.gson.Gson;

import ca.uoft.cs.mavo.IStarLink;
import ca.uoft.cs.mavo.IStarNode;
import ca.uoft.cs.mavo.InputFile;
import ca.uoft.cs.mavo.NodeOutput;
import ca.uoft.cs.mavo.OutputModel;
import ca.uoft.cs.mavo.SolveModel;
import ca.uoft.cs.util.FileUtils;
import ca.uoft.cs.util.ShellCommand;

public class Z3Solver {
		
	public void solveModel(InputFile inputModel) {
		//Create SMT file
		String smtFilePath = "temp/model.smt2";
		String analysisPath = "temp/output.json";
		StringBuilder sb = new StringBuilder();
		OutputModel outputModel = new OutputModel();
		
		convertModel2SMT(inputModel, sb);
		
		if(inputModel.getAction().equals("oneSolution")) {
		
			FileUtils.createFile(sb.toString(), smtFilePath);
			String[] analysisResult = executeSMT2File(smtFilePath).split("\n");
			if(analysisResult[0].equals("sat")) {
				result2OutputModel(analysisResult, outputModel);
			}else {
				outputModel.setIsSat("unsat");
			}
			
		}else if(inputModel.getAction().equals("allSolutions")) {
			//TODO #7
		}
		
		convertAnalysis2JSON(outputModel, analysisPath);
		
	}

	private void convertAnalysis2JSON(OutputModel outputModel, String analysisPath) {
		//Gson gson = new GsonBuilder().setPrettyPrinting().create();
		Gson gson = new Gson();
		FileUtils.createFile(gson.toJson(outputModel), analysisPath);
	}

	private void result2OutputModel(String[] analysisResult, OutputModel outputModel) {
		for(int i = 1; i < analysisResult.length; i++) {
			if(!analysisResult[i].contains("sat")) {
				if(analysisResult[i].contains("n")) {
					NodeOutput node = new NodeOutput();
					String nodeId = analysisResult[i].replace("\"", "");
					nodeId = nodeId.replace("n","");
					node.setNodeId(nodeId);
					node.addSatValue(analysisResult[++i]);
					outputModel.getNodesList().add(node);
				}
			}
		}
	}

	/**
	 * Create a string with the SMT2 representation of the model
	 * @param inputModel
	 * Model received from frontend
	 * @param sb
	 * variable to receive the SMT2 generated
	 */
	private void convertModel2SMT(InputFile inputModel, StringBuilder sb) {
		convertingNodes(inputModel, sb);
		linkPropagation(inputModel, sb);
		//Adding check-sat statement
		sb.append(SMT.checkSat());
		//Print the values for each node
		printValNodes(inputModel, sb);
	}

	private void printValNodes(InputFile inputModel, StringBuilder sb) {
		sb.append(";Print values for each node\n");
		for(IStarNode node : inputModel.getModel().getNodes()) {
			sb.append(SMT.echo("n"+node.getId()));
			sb.append("\n");
			sb.append(SMT.eval("n"+node.getId()));
			sb.append("\n");
		}
		
		
	}

	private void linkPropagation(InputFile inputModel, StringBuilder sb) {
		ArrayList<String> prop = new ArrayList<>();
		ArrayList<String> sameValue = new ArrayList<>();
		ArrayList<IStarLink> sameTargetLinks = new ArrayList<>();
		
		for(IStarLink iStarLink : inputModel.getModel().getLinks()) {
			if(!iStarLink.getAdded()) {
				iStarLink.setAdded(true);
				//Getting links with the same target
				sameTargetLinks.clear();
				sameValue.clear();
				String targetProp = "";
				sameTargetLinks.add(iStarLink);
				String linkTarget = iStarLink.getTarget();
				for(IStarLink iStarLink2 : inputModel.getModel().getLinks()) {
					if(!iStarLink.equals(iStarLink2) && linkTarget.equals(iStarLink2.getTarget())) {
						iStarLink2.setAdded(true);
						sameTargetLinks.add(iStarLink2);
					}
				}
			
				IStarNode targetNode = IStarNode.getLink(iStarLink.getTarget(), inputModel.getModel().getNodes());
				if(targetNode!=null) {
					//Type of propagation
					switch (targetNode.getType()) {
					//GOAL TARGET
					case "G":
						prop.clear();
						//Refinement and qualification propagation
						for(IStarLink sameTargetLink: sameTargetLinks) {
							switch (sameTargetLink.getType()) {
							case "AND":
								prop.add(SMT.greatEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
								break;
							case "OR":
								prop.add(SMT.lessEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
								break;
							case "QUALIFICATION":
								prop.add(SMT.greatEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
								break;
							case "DEPENDENCY":
								prop.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
								break;
							}	
							//The target node has to have the same value of one source node
							sameValue.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
						}
						targetProp = SMT.and(prop);
						sb.append(";Link propagation\n");
						sb.append(SMT.assertion(targetProp));
						if(!sameValue.isEmpty()) {
							sb.append(";Node same values\n");
							sb.append(SMT.assertion(SMT.or(sameValue)));							
						}
						break;
					//TASK TARGET
					case "T":
						prop.clear();
						//Refinement, qualification, neededby propagation
						for(IStarLink sameTargetLink: sameTargetLinks) {
							switch (sameTargetLink.getType()) {
							case "AND":
								prop.add(SMT.greatEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
								break;
							case "OR":
								prop.add(SMT.lessEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
								break;
							case "QUALIFICATION":
								prop.add(SMT.greatEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
								break;
							case "NEEDEDBY":
								prop.add(SMT.greatEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
								break;
							case "DEPENDENCY":
								prop.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
								break;
							}

							//The target node has to have the same value of one source node
							sameValue.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
						}
						
						targetProp = SMT.and(prop);
						sb.append(";Link propagation\n");
						sb.append(SMT.assertion(targetProp));
						if(!sameValue.isEmpty()) {
							sb.append(";Node same values\n");
							sb.append(SMT.assertion(SMT.or(sameValue)));							
						}
						break;
					//TARGET QUALITY (SOFTGOAL)
					case "S":
						ArrayList<String> contributionLinks = new ArrayList<>();
						for(IStarLink sameTargetLink: sameTargetLinks) {
						//Contribuition propagation
							switch (sameTargetLink.getType()) {
							case "MAKES":
								contributionLinks.add(SMT.greatEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
								break;
							case "HELPS":
								ArrayList<String> terms = new ArrayList<>();
								terms.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.FS),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PS)
									));
								terms.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.PS),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PS)
									));
								terms.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.PD),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PD)
									));
								terms.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.FD),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PD)
									));
								terms.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.UNK),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.UNK)
									));
								terms.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.CONF),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.CONF)
									));
								contributionLinks.add(SMT.or(terms));
								break;
							case "HURTS":
								ArrayList<String> terms1 = new ArrayList<>();
								terms1.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.FS),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PD)
									));
								terms1.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.PS),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PD)
									));
								terms1.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.PD),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PD)
									));
								terms1.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.FD),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PD)
									));
								terms1.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.UNK),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.UNK)
									));
								terms1.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.CONF),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.CONF)
									));
								contributionLinks.add(SMT.or(terms1));
								break;
							case "BREAKS":
								ArrayList<String> terms2 = new ArrayList<>();
								terms2.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.FS),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.FD)
									));
								terms2.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.PS),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PD)
									));
								terms2.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.PD),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PS)
									));
								terms2.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.FD),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PS)
									));
								terms2.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.UNK),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.UNK)
									));
								terms2.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.CONF),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.CONF)
									));
								contributionLinks.add(SMT.or(terms2));
								break;
							case "DEPENDENCY":
								prop.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
								break;
							}
							//The target node has to have the same value of one source node
							sameValue.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));

						}
						
						String output = "";
						if(contributionLinks.size() > 1) {
							 output = output + SMT.and(contributionLinks);
						}else {
							output = contributionLinks.get(0);
						}
						//Assume that it can be conflict
						String assumeConflict = SMT.equal("n"+linkTarget, SatValues.CONF);
						sb.append(";Link propagation \n");
						sameValue.add(output);
						sameValue.add(assumeConflict);
						sb.append(SMT.assertion(SMT.or(sameValue)));
						break;
					 
					//RESOURCE
					case "R":
						prop.clear();
						//Refinement, qualification, neededby propagation
						for(IStarLink sameTargetLink: sameTargetLinks) {
							switch (sameTargetLink.getType()) {
							case "QUALIFICATION":
								prop.add(SMT.greatEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
								break;
							case "DEPENDENCY":
								prop.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
								break;
							}
							//The target node has to have the same value of one source node
							sameValue.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
						}
						
						targetProp = SMT.and(prop);
						sb.append(";Link propagation\n");
						sb.append(SMT.assertion(targetProp));
						if(!sameValue.isEmpty()) {
							sb.append(";Node same values\n");
							sb.append(SMT.assertion(SMT.or(sameValue)));							
						}						
						break;
					}
				}
			}		
		}
	}

	private void convertingNodes(InputFile inputModel, StringBuilder sb) {
		//Converting nodes into int const
		for(IStarNode iStarNode : inputModel.getModel().getNodes()) {
			//If the node is annotated with 'S' create mode nodes of same type
			if(iStarNode.getAnnotation().contains("S")) {
				for(int i = 1; i <= Integer.parseInt(iStarNode.getMaxsize()); i++) {
					sb.append(SMT.constInt("n"+i+iStarNode.getId()));		
				}
			}
			sb.append(SMT.constInt("n"+iStarNode.getId()));
			
			//Setting initial values if they exist
			if(!iStarNode.getSatValue().equals(SatValues.NONE)) {
				sb.append(SMT.assertion(SMT.equal("n"+iStarNode.getId(), iStarNode.getSatValue())));
			}
			
			//Defining range of values
			sb.append(";Adding node value range\n");
			sb.append(SMT.assertion(
					SMT.and(
							SMT.lessEqual("n"+iStarNode.getId(), SatValues.FD),
							SMT.greatEqual("n"+iStarNode.getId(), SatValues.FS)
					)));
			
		}
	}

	private String executeSMT2File(String smtFilePath) {
		String z3Path;
		if(SolveModel.DEVELOP) {
			z3Path = "z3";			
		}else {
			z3Path = "/u/marcel/z3-4.5.0-x64-ubuntu-14.04/bin/z3";
		}
		String options = " -smt2 ";
		String command = z3Path + options + smtFilePath;
		
		String output = ShellCommand.executeCommand(command);
		
		return output;
		
	}

}
