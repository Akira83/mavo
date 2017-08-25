package ca.uoft.cs.mavo;

import java.io.FileReader;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import ca.uoft.cs.mavo.z3solver.Z3Solver;
import ca.uoft.cs.util.FileUtils;

/**
 * SolveModelTest 
 * This class is the main app class called in the backend.
 * It is responsible to get the json model file produced in the frontend and process into the model used in the backend.
 * Then it executes all analysis creating a output file that has the json analysed file to be send back to the frontend.
 *
 */
public class SolveModel {

	/**
	 * This method is responsible to execute all steps to generate the analysis file.
	 * @param args
	 * As parameters it receives the name of the file to be created.
	 * Note: create a parameter to decide if it will execute a new analysis or use an existent one.
	 * 		Alicia->Marcel: What does this note mean?
	 */
	public static void main(String[] args) {

		//This is the default filePath to be executed if no file is pass through parameters
		String filePath = "temp/"; 			
		String inputFile = "default.json";
		String outputFile = "output.json";
				
		try {
			//creating the backend model to be analysed
			InputFile inputModel = getModelFromJson(filePath + inputFile);
			
			//Analyse the model
			Z3Solver solver = new Z3Solver();
			solver.solveModel(inputModel);
			
			createOutputFile(solver.getAnalysis(), filePath + outputFile);
	
		} catch (Exception e) {
			throw new RuntimeException(e.getMessage());
		} 
	}

	/**
	 * This method converts the Output object with the analyzed data into a json object file to be sent to frontend.
	 * @param TroposCSPAlgorithm
	 * The solver object that contains all necessary data.
	 * @param filePath
	 * Name of the file to be read by CGI to be sent to frontend
	 */
	private static void createOutputFile(OutputModel outputModel, String filePath) {
		Gson gson = new GsonBuilder().setPrettyPrinting().create();		
		FileUtils.createFile(gson.toJson(outputModel), filePath);
	}

	/**
	 * This method converts the model file sent by the frontend into the ModelSpecPojo in order to be analysed
	 * @param filePath
	 * Path to the file with the frontend model
	 * @return
	 * ModelSpecPojo backend model
	 */
	private static InputFile getModelFromJson(String filePath) {
		try{
		Gson gson = new Gson();		
		InputFile inputFile = gson.fromJson(new FileReader(filePath), InputFile.class);
		return inputFile;
		}catch(Exception e){
			throw new RuntimeException("Error in getModelFromJson() method: /n" + e.getMessage());
		}
	}
}