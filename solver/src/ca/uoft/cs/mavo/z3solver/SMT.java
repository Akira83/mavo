package ca.uoft.cs.mavo.z3solver;

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
				+ ")\n";
		return output;
	}

	public static String assertion(String value) {
		String output = "(assert \n"
				+ value
				+ ")\n";
		return output;
	}

}
