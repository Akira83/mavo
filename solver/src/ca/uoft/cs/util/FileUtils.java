package ca.uoft.cs.util;

import java.io.File;
import java.io.PrintWriter;

public class FileUtils {

	public static void createFile(String content, String filePath) {
		try {
			File file;
			file = new File(filePath);
			if (!file.exists()) {
				file.createNewFile();
			}else {
				file.delete();
				file.createNewFile();
			}
			PrintWriter printFile = new PrintWriter(file);
			printFile.printf(content);
			printFile.close();
		} catch (Exception e) {
			throw new RuntimeException("Error in FileUtils.createFile(): " + e.getMessage());
		}		
	}
	
}
