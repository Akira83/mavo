package ca.uoft.cs.mavo.z3solver;

import java.util.ArrayList;

public class SMT {

	public static String constInt(String string) {
		String output = "(declare-const "
				+ string
				+ " Int)\n";
		return output;
	}

	public static String checkSat() {
		String output = "(check-sat)\n";
		return output;
	}

	public static String equal(String value1, String value2) {
		String output = "(= "
				+ value1
				+ " "
				+ value2
				+ ")";
		return output;
	}

	public static String assertion(String value) {
		String output = "(assert \n"
				+ "\t" + value
				+ ")\n";
		return output;
	}

	public static String lessEqual(String value1, String value2) {
		String output = "(<= "
				+ value1
				+ " "
				+ value2
				+ ")";
		return output;
	}

	public static String greatEqual(String value1, String value2) {
		String output = "(>= "
				+ value1
				+ " "
				+ value2
				+ ")";
		return output;
	}

	public static String and(ArrayList<String> prop) {
		StringBuilder sb = new StringBuilder();
		sb.append("(and \n");
		for(String input : prop) {
			sb.append(input);
		}
		sb.append(")\n");
		return sb.toString();
	}

	public static String and(String value1, String value2) {
		String output = "(and \n"
				+ value1
				+ "\n "
				+ value2
				+ ")\n";
		return output;
	}

	
	public static String or(String value1, String value2) {
		String output = "(or \n"
				+ value1
				+ "\n "
				+ value2
				+ ")\n";
		return output;
	}
	
	public static String or(ArrayList<String> terms) {
		StringBuilder sb = new StringBuilder();
		sb.append("(or \n");
		for(String input : terms) {
			sb.append(input);
		}
		sb.append(")\n");
		return sb.toString();
	}

	public static String echo(String string) {
		String output = "(echo \""+string+"\")";
		return output;
	}

	public static String eval(String string) {
		String output = "(eval "+string+")";
		return output;
	}

}
