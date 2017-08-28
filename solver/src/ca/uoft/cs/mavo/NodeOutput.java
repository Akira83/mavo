package ca.uoft.cs.mavo;

import java.util.ArrayList;

public class NodeOutput {
	String nodeId = "";
	ArrayList<String> satValues = new ArrayList<>();
	
	public String getNodeId() {
		return nodeId;
	}
	
	public void setNodeId(String nodeId) {
		this.nodeId = nodeId;
	}
	
	public ArrayList<String> getSatValues() {
		return satValues;
	}
	
	public void setSatValues(ArrayList<String> satValues) {
		this.satValues = satValues;
	}
	
	public void addSatValue(String newSatValue) {
		this.satValues.add(newSatValue);
	}
	
}
