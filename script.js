// Define parameters and initial state
let currentScene = 0;
const scenes = [
    { id: "scene1", title: "Scene 1 Title", description: "Description of Scene 1" },
    { id: "scene2", title: "Scene 2 Title", description: "Description of Scene 2" },
    { id: "scene3", title: "Scene 3 Title", description: "Description of Scene 3" }
];

// Initialize the visualization
function initialize() {
    renderScene();
    addNavigation();
}

// Render the current scene
function renderScene() {
    const sceneContainer = d3.select("#scene-container");
    sceneContainer.html(""); // Clear previous scene

    const scene = scenes[currentScene];
    
    // Example visualization - Replace with your D3 code
    sceneContainer.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .text(scene.title);

    // Add annotations
    const annotationsContainer = d3.select("#annotations-container");
    annotationsContainer.html(""); // Clear previous annotations
    annotationsContainer.append("h2").text(scene.title);
    annotationsContainer.append("p").text(scene.description);
}

// Add navigation buttons
function addNavigation() {
    const container = d3.select("body")
        .append("div")
        .attr("id", "navigation-container");

    container.append("button")
        .text("Previous")
        .on("click", previousScene);

    container.append("button")
        .text("Next")
        .on("click", nextScene);
}

function previousScene() {
    if (currentScene > 0) {
        currentScene--;
        renderScene();
    }
}

function nextScene() {
    if (currentScene < scenes.length - 1) {
        currentScene++;
        renderScene();
    }
}


document.addEventListener("DOMContentLoaded", initialize);
