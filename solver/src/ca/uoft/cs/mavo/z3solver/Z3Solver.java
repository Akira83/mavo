package ca.uoft.cs.mavo.z3solver;

import java.util.ArrayList;

import ca.uoft.cs.mavo.IStarLink;
import ca.uoft.cs.mavo.IStarNode;
import ca.uoft.cs.mavo.InputFile;
import ca.uoft.cs.mavo.OutputModel;
import ca.uoft.cs.util.FileUtils;
import ca.uoft.cs.util.ShellCommand;

public class Z3Solver {
	
	private OutputModel outputModel;
	
	public void solveModel(InputFile inputModel) {
		//Create SMT file
		String smtFilePath = "temp/model.smt2";
		StringBuilder sb = new StringBuilder();

		convertModel2SMT(inputModel, sb);
		
		if(inputModel.getAction().equals("oneSolution")) {
		
			FileUtils.createFile(sb.toString(), smtFilePath);
			String analysisResult = executeSMT2File(smtFilePath);
			this.outputModel = result2OutputModel(analysisResult);

		}else if(inputModel.getAction().equals("allSolutions")) {
			
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

		ArrayList<IStarLink> sameTargetLinks = new ArrayList<>();
		for(IStarLink iStarLink : inputModel.getModel().getLinks()) {
			//Getting links with the same target
			sameTargetLinks.clear();
			String targetProp = "";
			sameTargetLinks.add(iStarLink);
			String linkTarget = iStarLink.getTarget();
			for(IStarLink iStarLink2 : inputModel.getModel().getLinks()) {
				if(!iStarLink.equals(iStarLink2) && linkTarget.equals(iStarLink2.getTarget())) {
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
						}
					}
					targetProp = SMT.and(prop);
					sb.append(SMT.assertion(targetProp));
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
						}
					}
					targetProp = SMT.and(prop);
					sb.append(SMT.assertion(targetProp));
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
						}
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
					sb.append(SMT.assertion(SMT.or(output, assumeConflict)));
					break;
				 
				//RESOURCE
				case "R":
					prop.clear();
					//Refinement, qualification, neededby propagation
					for(IStarLink sameTargetLink: sameTargetLinks) {
						if(sameTargetLink.getType().equals("QUALIFICATION"))
							prop.add(SMT.greatEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
					}
					targetProp = SMT.and(prop);
					sb.append(SMT.assertion(targetProp));
					break;
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

	private OutputModel result2OutputModel(String analysisResult) {
		// TODO Auto-generated method stub
		return null;
	}

	private String executeSMT2File(String smtFilePath) {
		String z3Path = "z3";
		String options = " -smt2 ";
		String command = z3Path + options + smtFilePath;
		
		String output = ShellCommand.executeCommand(command);
		
		return output;
		
	}

	public OutputModel getAnalysis() {
		if(outputModel!=null) {
			return outputModel;
		}
		return new OutputModel("noSolution");
	}

}
