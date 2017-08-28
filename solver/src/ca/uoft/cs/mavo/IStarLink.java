package ca.uoft.cs.mavo;

public class IStarLink {

	private String source;
	private String target;
	private String type;
	private String annotation;
	private Boolean added = false;
	
	public String getSource() {
		return source;
	}
	
	public void setSource(String source) {
		this.source = source;
	}
	
	public String getTarget() {
		return target;
	}
	
	public void setTarget(String target) {
		this.target = target;
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

	public Boolean getAdded() {
		return added;
	}

	public void setAdded(Boolean added) {
		this.added = added;
	}
	
}
