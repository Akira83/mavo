package ca.uoft.cs.mavo.z3solver;

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
		//Creating nodes
		for(IStarNode iStarNode : inputModel.getModel().getNodes()) {
			sb.append(SMT.declIntConst("n"+iStarNode.getId()));
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
