package ca.uoft.cs.mavo;

import java.util.ArrayList;

public class IStarModel {
	
	private ArrayList<IStarActor> actors = new ArrayList<>();
	private ArrayList<IStarNode> nodes = new ArrayList<>();
	private ArrayList<IStarLink> links = new ArrayList<>();
	
	public ArrayList<IStarActor> getActors() {
		return actors;
	}
	
	public void setActors(ArrayList<IStarActor> actors) {
		this.actors = actors;
	}
	
	public ArrayList<IStarNode> getNodes() {
		return nodes;
	}
	
	public void setNodes(ArrayList<IStarNode> nodes) {
		this.nodes = nodes;
	}
	
	public ArrayList<IStarLink> getLinks() {
		return links;
	}
	
	public void setLinks(ArrayList<IStarLink> links) {
		this.links = links;
	}
	
}
