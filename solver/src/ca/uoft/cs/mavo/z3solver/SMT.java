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

}
