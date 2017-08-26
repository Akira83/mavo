package ca.uoft.cs.mavo;

import java.util.ArrayList;

public class IStarNode {
	private String id;
	private String actorId;
	private String name;
	private String type;
	private String annotation;
	private String maxsize;
	private String satValue;
	
	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id = id;
	}
	
	public String getActorId() {
		return actorId;
	}
	
	public void setActorId(String actorId) {
		this.actorId = actorId;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	public String getAnnotation() {
		return annotation;
	}

	public void setAnnotation(String annotation) {
		this.annotation = annotation;
	}

	public String getMaxsize() {
		return maxsize;
	}
	
	public void setMaxsize(String maxsize) {
		this.maxsize = maxsize;
	}
	
	public String getSatValue() {
		return satValue;
	}

	public void setSatValue(String satValue) {
		this.satValue = satValue;
	}

	public static IStarNode getLink(String target, ArrayList<IStarNode> nodes) {
		for(IStarNode node : nodes) {
			if(node.getId().equals(target)) {
				return node;
			}
		}
		return null;
	}
}
