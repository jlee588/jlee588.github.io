async function loadData() {
    const gdpData = await d3.csv('gdp.csv');
    const incomeData = await d3.csv('income.csv');
    const lexData = await d3.csv('lex.csv');
    const popData = await d3.csv('pop.csv');
    
    return { gdpData, incomeData, lexData, popData };
}


async function drawVisualization() {
    const { gdpData, incomeData, lexData, popData } = await loadData();


    gdpData.forEach(d => d.year = +d.year);
    incomeData.forEach(d => d.year = +d.year);
    lexData.forEach(d => d.year = +d.year);
    popData.forEach(d => d.year = +d.year);

    // canvas
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#visualization")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // scaling
    const x = d3.scaleLinear()
        .domain(d3.extent(gdpData, d => d.year))
        .range([0, width]);

    const y1 = d3.scaleLinear()
        .domain([0, d3.max(gdpData, d => +d.gdp)]).nice()
        .range([height, 0]);

    const y2 = d3.scaleLinear()
        .domain([0, d3.max(incomeData, d => +d.income)]).nice()
        .range([height, 0]);

    const y3 = d3.scaleLinear()
        .domain([0, d3.max(lexData, d => +d.life_expectancy)]).nice()
        .range([height, 0]);

    const y4 = d3.scaleLinear()
        .domain([0, d3.max(popData, d => +d.population)]).nice()
        .range([height, 0]);

    // x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // gdp y 
    svg.append("g")
        .call(d3.axisLeft(y1))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("GDP");

    // y-axis
    svg.append("g")
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(y2))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 40)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Income");

    svg.append("g")
        .attr("transform", `translate(${width - 60},0)`)
        .call(d3.axisRight(y3))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 40)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Life Expectancy");

    svg.append("g")
        .attr("transform", `translate(${width - 120},0)`)
        .call(d3.axisRight(y4))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 40)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Population");

    // generating lines
    const lineGDP = d3.line()
        .x(d => x(d.year))
        .y(d => y1(d.gdp));

    const lineIncome = d3.line()
        .x(d => x(d.year))
        .y(d => y2(d.income));

    const lineLifeExpectancy = d3.line()
        .x(d => x(d.year))
        .y(d => y3(d.life_expectancy));

    const linePopulation = d3.line()
        .x(d => x(d.year))
        .y(d => y4(d.population));

    // lines, might need to edit
    svg.append("path")
        .datum(gdpData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", lineGDP);

    svg.append("path")
        .datum(incomeData)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 1.5)
        .attr("d", lineIncome);

    svg.append("path")
        .datum(lexData)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", lineLifeExpectancy);

    svg.append("path")
        .datum(popData)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 1.5)
        .attr("d", linePopulation);

    // interactive and mouse move
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
    
            focus.attr("transform", `translate(${x(d.year)},${y1(d.gdp)})`);
            focus.select("text").text(d.gdp);
    
            d3.select("#annotationText").text(`Year: ${d.year}, GDP: ${d.gdp}, Income: ${incomeData[i].income}, Life Expectancy: ${lexData[i].life_expectancy}, Population: ${popData[i].population}`);
        }
    }
    
    drawVisualization();
       
