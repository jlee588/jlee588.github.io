async function loadData() {
    try {
        const gdpData = await d3.csv('https://raw.githubusercontent.com/jlee588/jlee588.github.io/main/gdp.csv');
        const incomeData = await d3.csv('https://raw.githubusercontent.com/jlee588/jlee588.github.io/main/income.csv');
        const lexData = await d3.csv('https://raw.githubusercontent.com/jlee588/jlee588.github.io/main/lex.csv');
        const popData = await d3.csv('https://raw.githubusercontent.com/jlee588/jlee588.github.io/main/pop.csv');
    
        console.log('GDP Data:', gdpData);
        console.log('Income Data:', incomeData);
        console.log('Life Expectancy Data:', lexData);
        console.log('Population Data:', popData);

        return { gdpData, incomeData, lexData, popData };
    } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async function drawVisualization(scene = 0) {
        const { gdpData, incomeData, lexData, popData } = await loadData();
    
        if (!gdpData || !incomeData || !lexData || !popData) {
            console.error('Data loading failed.');
            return;
        }
    
        // Parse the data
        gdpData.forEach(d => d.year = +d.year);
        incomeData.forEach(d => d.year = +d.year);
        lexData.forEach(d => d.year = +d.year);
        popData.forEach(d => d.year = +d.year);
    
        // Set up the SVG canvas dimensions
        const margin = { top: 20, right: 30, bottom: 50, left: 60 };
        const width = 960 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
    
        // Clear previous visualization
        d3.select("#visualization").html("");

        const svg = d3.select("#visualization")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    
        // Define scales
        const x = d3.scaleLinear()
            .domain([d3.min(gdpData, d => d.year), d3.max(gdpData, d => d.year)])
            .range([0, width]);
    
        const yGDP = d3.scaleLinear()
            .domain([0, d3.max(gdpData, d => +d.gdp)]).nice()
            .range([height, 0]);
    
        const ySecondary = d3.scaleLinear()
            .range([height, 0]);
    
        if (scene === 0) {
            ySecondary.domain([0, d3.max(incomeData, d => +d.income)]).nice();
        } else if (scene === 1) {
            ySecondary.domain([0, d3.max(lexData, d => +d.life_expectancy)]).nice();
        } else if (scene === 2) {
            ySecondary.domain([0, d3.max(popData, d => +d.population)]).nice();
        }
    
        // Add the x-axis
        svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        // Add the y-axis for GDP
        svg.append("g")
        .attr("class", "y-axis-left")
        .call(d3.axisLeft(yGDP))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("GDP");

        // Add the y-axis for secondary metric
        svg.append("g")
        .attr("class", "y-axis-right")
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(ySecondary))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 40)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text(scene === 0 ? "Income" : scene === 1 ? "Life Expectancy" : "Population");

        // Line generators
        const lineGDP = d3.line()
        .x(d => x(d.year))
        .y(d => yGDP(d.gdp))
        .curve(d3.curveMonotoneX); // Smooth line

        const lineSecondary = d3.line()
        .x(d => x(d.year))
        .y(d => {
            if (scene === 0) return ySecondary(incomeData.find(e => e.year === d.year)?.income);
            if (scene === 1) return ySecondary(lexData.find(e => e.year === d.year)?.life_expectancy);
            if (scene === 2) return ySecondary(popData.find(e => e.year === d.year)?.population);
        })
        .curve(d3.curveMonotoneX); // Smooth line

        // Add the lines
        svg.append("path")
        .datum(gdpData)
        .attr("class", "line-gdp")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", lineGDP);

        svg.append("path")
        .datum(gdpData)
        .attr("class", "line-secondary")
        .attr("fill", "none")
        .attr("stroke", scene === 0 ? "green" : scene === 1 ? "red" : "orange")
        .attr("stroke-width", 1.5)
        .attr("d", lineSecondary);
    
        // Add interactivity and annotations
        const focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");
    
        focus.append("circle")
            .attr("r", 5);
    
        focus.append("text")
            .attr("x", 9)
            .attr("dy", ".35em");
    
        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", () => focus.style("display", null))
            .on("mouseout", () => focus.style("display", "none"))
            .on("mousemove", mousemove);
    
        function mousemove(event) {
            const bisect = d3.bisector(d => d.year).left;
            const x0 = x.invert(d3.pointer(event, this)[0]);
            const i = bisect(gdpData, x0, 1);
            const d0 = gdpData[i - 1];
            const d1 = gdpData[i];
            const d = x0 - d0.year > d1.year - x0 ? d1 : d0;
        
            focus.attr("transform", `translate(${x(d.year)},${yGDP(d.gdp)})`);
            
            let secondaryValue;
            if (scene === 0) {
                secondaryValue = incomeData.find(e => e.year === d.year)?.income;
            } else if (scene === 1) {
                secondaryValue = lexData.find(e => e.year === d.year)?.life_expectancy;
            } else if (scene === 2) {
                secondaryValue = popData.find(e => e.year === d.year)?.population;
            }
        
            focus.select("text").text(`GDP: ${d.gdp}, ${scene === 0 ? "Income" : scene === 1 ? "Life Expectancy" : "Population"}: ${secondaryValue}`);
        }
    
        // Navigation functionality
        const scenes = [0, 1, 2];
        let currentScene = scene;
    
        document.getElementById('prev').onclick = function() {
            if (currentScene > 0) {
                currentScene--;
                drawVisualization(currentScene);
            }
        };
    
        document.getElementById('next').onclick = function() {
            if (currentScene < scenes.length - 1) {
                currentScene++;
                drawVisualization(currentScene);
            }
        };
    }
    
    const zoom = d3.zoom()
    .scaleExtent([1, 10]) // Set the zoom scale extent
    .translateExtent([[0, 0], [width, height]]) // Set the translation extent
    .extent([[0, 0], [width, height]]) // Set the zoomable extent
    .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed(event) {
        const transform = event.transform;
        const newX = transform.rescaleX(x);
        const newYGDP = transform.rescaleY(yGDP);

        svg.selectAll(".x-axis").call(d3.axisBottom(newX));
        svg.selectAll(".y-axis-left").call(d3.axisLeft(newYGDP));

        svg.selectAll(".line-gdp")
            .attr("d", lineGDP.x(d => newX(d.year)).y(d => newYGDP(d.gdp)));

        svg.selectAll(".line-secondary")
            .attr("d", lineSecondary.x(d => newX(d.year)).y(d => {
                if (scene === 0) return ySecondary(incomeData.find(e => e.year === d.year)?.income);
                if (scene === 1) return ySecondary(lexData.find(e => e.year === d.year)?.life_expectancy);
                if (scene === 2) return ySecondary(popData.find(e => e.year === d.year)?.population);
            }));
    }

    drawVisualization();