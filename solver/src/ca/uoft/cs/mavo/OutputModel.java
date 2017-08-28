package ca.uoft.cs.mavo;

import java.util.ArrayList;

public class OutputModel {
	private String isSat;
	private ArrayList<NodeOutput> nodesList = new ArrayList<>();
	
	public String getIsSat() {
		return isSat;
	}

	public void setIsSat(String isSat) {
		this.isSat = isSat;
	}

	public ArrayList<NodeOutput> getNodesList() {
		return nodesList;
	}

	public void setNodesList(ArrayList<NodeOutput> nodesList) {
		this.nodesList = nodesList;
	}
		
}
