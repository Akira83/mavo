package ca.uoft.cs.util;

import java.io.BufferedReader;
import java.io.InputStreamReader;

public class ShellCommand {
	
	/**
	 * Execute a shell command.
	 * @param command
	 * String of the command to be executed.
	 * @return
	 * Output of the execution.
	 */
	public static String executeCommand(String command) {
		StringBuffer output = new StringBuffer();
		Process p;
		try {
			p = Runtime.getRuntime().exec(command);
			p.waitFor();
			BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
			String line = "";
			while ((line = reader.readLine())!= null) {
				output.append(line + "\n");
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return output.toString();

	}

}
