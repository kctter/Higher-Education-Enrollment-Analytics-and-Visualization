function makePlot() {
    plot1("./data/GPA.csv");
    plot2("./data/GPA.csv");
    plot3("./data/ENR.csv");
    plot4("./data/California County Boundaries.geojson", "./data/MAP.csv");
    plot5("./data/GPA.csv");
}

const plot1 = function (filePath) {
    d3.csv(filePath).then(function (data) {
        const margin = {top: 75, right: 75, bottom: 75, left: 100},
            width = 960 - margin.left - margin.right,
            height = 480 - margin.top - margin.bottom;

        const radius = 5;

        const svg = d3.select("#plot_1")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => parseFloat(d["App GPA"])))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => parseFloat(d["Adm GPA"])))
            .range([height, 0]);

        const colors = d3.scaleOrdinal()
            .domain(new Set(d3.map(data, d => d["Origin"])))
            .range(["Red", "Blue"]);

        const xAxis = d3.axisBottom(xScale);

        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "axis-label")
            .attr("x", width / 2)
            .attr("y", margin.bottom / 2)
            .text("Application GPA");

        svg.append("g")
            .call(yAxis)
            .append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left / 2)
            .attr("x", -height / 2)
            .text("Enrolled GPA");

        const tooltip = svg.append("text")
            .attr("class", "tooltip")
            .style("opacity", 0);


        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(parseFloat(d["App GPA"])))
            .attr("cy", d => yScale(parseFloat(d["Adm GPA"])))
            .attr("r", radius)
            .style("fill", d => colors(d["Origin"]))
            .on("mouseover", () => tooltip.style("opacity", 1))
            .on("mousemove", (e, d) => {
                tooltip.text(
                    "App GPA: " + Math.round(d["App GPA"] * 100) / 100 +
                    " | " +
                    "Adm GPA: " + Math.round(d["Adm GPA"] * 100) / 100
                )
                    .attr("x", e.x - margin.left)
                    .attr("y", e.y - margin.top * 3)
            })
            .on("mouseleave", () => tooltip.style("opacity", 0))
            .transition()
            .duration(100)
            .delay((d, i) => i * 1)
            .style("opacity", 0)
            .transition()
            .duration(100)
            .delay((d, i) => i * 5)
            .style("opacity", 1);


        const legend = svg.selectAll(".legend")
            .data(colors.domain())
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

        legend.append("rect")
            .attr("x", width + 5)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", colors);

        legend.append("text")
            .attr("x", width + 25)
            .attr("y", 12.5)
            .text(d => d);

        svg.append("g")
            .call(xAxis)
            .attr("transform", "translate(0," + height + ")")
            .append("text")
            .attr("x", width / 2)
            .attr("y", margin.bottom / 2)
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .text("App GPA");

        svg.append("g")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left / 2)
            .attr("x", -height / 2)
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .text("Adm GPA");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 0 - margin.top / 2)
            .attr("text-anchor", "middle")
            .text("FR App and Adm vs. TR App and Adm");
    });
};

const plot2 = function (filePath) {
    d3.csv(filePath).then(function (data) {
        const margin = {top: 75, right: 75, bottom: 75, left: 100},
            width = 960 - margin.left - margin.right,
            height = 480 - margin.top - margin.bottom;

        const svg = d3.select("#plot_2")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const drawPlot = (gpa) => {
            svg.selectAll("*").remove();

            const xScale = d3.scaleBand()
                .domain(data.map(d => d["Year"]))
                .range([0, width]);

            const yScale = d3.scaleLinear()
                .domain(d3.extent(data, d => d[gpa]))
                .range([height, 0]);

            const colors = d3.scaleOrdinal()
                .domain(new Set(d3.map(data, d => d["Origin"])))
                .range(["Red", "Blue"]);

            const line = d3.line()
                .x(d => xScale(d.Year))
                .y(d => yScale(d[gpa]));

            const groupedData = d3.groups(data, d => d["Origin"]);

            const paths = svg.selectAll(".line")
                .data(groupedData)
                .enter()
                .append("path")
                .attr("class", "line")
                .attr("fill", "none")
                .attr("d", d => line(d[1]))
                .attr("stroke", d => colors(d[0]))
                .transition()
                .duration(100)
                .style("opacity", 0)
                .transition()
                .duration(100)
                .delay((d, i) => i * 5)
                .style("opacity", 1);

            const xAxis = d3.axisBottom(xScale);

            const yAxis = d3.axisLeft(yScale);

            const legend = svg.selectAll(".legend")
                .data(colors.domain())
                .enter()
                .append("g")
                .attr("class", "legend")
                .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

            legend.append("rect")
                .attr("x", width + 5)
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", colors);

            legend.append("text")
                .attr("x", width + 25)
                .attr("y", 12.5)
                .text(d => d);

            svg.append("g")
                .call(xAxis)
                .attr("transform", "translate(0," + height + ")")
                .append("text")
                .attr("x", width / 2)
                .attr("y", margin.bottom / 2)
                .attr("fill", "black")
                .attr("text-anchor", "middle")
                .text("Year");

            svg.append("g")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left / 2)
                .attr("x", -height / 2)
                .attr("fill", "black")
                .attr("text-anchor", "middle")
                .text(gpa);

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", 0 - margin.top / 2)
                .attr("text-anchor", "middle")
                .text(gpa + " by Year and Origin");
        }

        const button = d3.selectAll("#radio_q2 input[type=radio]");
        let gpa = button.node().value;

        drawPlot(gpa);

        button.on("change", function () {
            gpa = d3.select(this).node().value;
            drawPlot(gpa);
        });

    });
}

const plot3 = function (filePath) {
    d3.csv(filePath).then(function (data) {
        const margin = {top: 75, right: 75, bottom: 75, left: 100},
            width = 960 - margin.left - margin.right,
            height = 480 - margin.top - margin.bottom;

        const svg = d3.select("#plot_3")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const subGroups = data.columns.slice(1);

        const groups = d3.map(data, d => d["Year"]);

        const xScale = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2]);


        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => parseFloat(d["FR ENR"]) + parseFloat(d["TR ENR"]))])
            .range([height, 0]);

        const colors = d3.scaleOrdinal()
            .domain(subGroups)
            .range(["Red", "Blue"]);

        const stackedData = d3.stack()
            .keys(subGroups)
            (data);

        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("fill", d => colors(d["key"]))
            .selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d["data"]["Year"]))
            .attr("y", d => yScale(d[1]))
            .attr("height", d => yScale(d[0]) - yScale(d[1]))
            .attr("width", xScale.bandwidth())
            .transition()
            .duration(100)
            .delay((d, i) => i * 5)
            .style("opacity", 0)
            .transition()
            .duration(100)
            .delay((d, i) => i * 5)
            .style("opacity", 1);

        const xAxis = d3.axisBottom(xScale);

        const yAxis = d3.axisLeft(yScale);

        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (width + 10) + ",0)");

        legend.selectAll("rect")
            .data(subGroups.map(string => string.slice(0, -4)))
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", d => colors(d));

        legend.selectAll("text")
            .data(subGroups.map(string => string.slice(0, -4)))
            .enter()
            .append("text")
            .attr("x", 20)
            .attr("y", (d, i) => i * 20 + 9)
            .text(d => d);

        svg.append("g")
            .call(xAxis)
            .attr("transform", "translate(0," + height + ")")
            .append("text")
            .attr("x", width / 2)
            .attr("y", margin.bottom / 2)
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .text("Year");

        svg.append("g")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left / 2)
            .attr("x", -height / 2)
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .text("App ENR Total");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 0 - margin.top / 2)
            .attr("text-anchor", "middle")
            .text("App Enr by Year and Origin");
    });
};

const plot4 = function (mapFilePath, dataFilePath) {
    d3.json(mapFilePath).then(function (geojson) {
        d3.csv(dataFilePath).then(function (data) {
            const margin = {top: 75, right: 75, bottom: 75, left: 200},
                width = 960 - margin.left - margin.right,
                height = 480 - margin.top - margin.bottom;

            const svg = d3.select("#plot_4")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            const drawPlot = (year) => {
                svg.selectAll("*").remove();

                const projection = d3.geoMercator()
                    .center([-119, 37.4])
                    .scale((1 << 18) / (50 * Math.PI))
                    .translate([width / 2, height / 2]);

                const path = d3.geoPath().projection(projection);

                const groupedData = d3.group(data, d => d["County"]);

                const colors = d3.scaleSequential(d3.interpolateReds)
                    .domain([0, d3.max(data, d => parseFloat(d["Pivot Field Values"]))]);

                svg.selectAll("#plot_3")
                    .data(geojson["features"])
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("fill", d => {
                        let value = groupedData.get(d["properties"]["name"]);
                        if (value === undefined) {
                            value = 0;
                        } else {
                            try {
                                value = parseFloat(value[year - 1994 + '']['Pivot Field Values']);
                            } catch (error) {
                                value = 0;
                            }
                        }
                        return colors(value)
                    })
                    .attr("stroke", "Black")
                    .attr("stroke-width", 1)
                    .transition()
                    .duration(100)
                    .style("opacity", 0)
                    .transition()
                    .duration(100)
                    .style("opacity", 1);

                const legendWidth = 200;
                const legendHeight = 10;

                const legendScale = d3.scaleLinear()
                    .domain(colors.domain())
                    .range([0, legendWidth]);

                const legendAxis = d3.axisBottom(legendScale)
                    .ticks(5);

                svg.append("g")
                    .attr("transform", "translate(0, " + height + " )")
                    .call(legendAxis);

                const linearGradient = svg
                    .append("linearGradient")
                    .attr("id", "linear-gradient");

                linearGradient.selectAll("stop")
                    .data(colors.ticks())
                    .enter()
                    .append("stop")
                    .attr("offset", d => d / d3.max(colors.domain()) * 100 + "%")
                    .attr("stop-color", d => colors(d));

                svg.append("rect")
                    .attr("x", 0)
                    .attr("y", height - legendHeight)
                    .attr("width", legendWidth)
                    .attr("height", legendHeight)
                    .style("fill", "url(#linear-gradient)");

                svg.append("text")
                    .attr("x", legendWidth / 2)
                    .attr("y", height + margin.bottom / 2)
                    .attr("text-anchor", "middle")
                    .text("ENR");

                svg.append("text")
                    .attr("x", width / 2)
                    .attr("y", 0 - margin.top / 2)
                    .attr("text-anchor", "middle")
                    .text("App Enr by Year and Origin County");
            }

            const slider = d3.selectAll("#year_slider");
            const year = d3.selectAll("#year");
            let currentYear = slider.node().value;
            year.text(currentYear);

            drawPlot(currentYear);


            slider.on("change", function () {
                currentYear = slider.node().value;
                year.text(currentYear);
                drawPlot(currentYear);
            });
        });
    });
};

const plot5 = function (filePath) {
    d3.csv(filePath).then(function (data) {
        const margin = {top: 75, right: 75, bottom: 75, left: 100},
            width = 960 - margin.left - margin.right,
            height = 480 - margin.top - margin.bottom;

        const svg = d3.select("#plot_5")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const groupedData = d3.group(data, d => d["Origin"]);
        const flattenedData = Array.from(groupedData, ([key, values]) => ({key, values}));

        const iqrData = flattenedData.map(d => {
            const gpaSorted = d.values.map(dd => dd["App GPA"]).sort(d3.ascending);

            const q1 = d3.quantile(gpaSorted, 0.25);
            const median = d3.quantile(gpaSorted, 0.5);
            const q3 = d3.quantile(gpaSorted, 0.75);
            const iqr = q3 - q1;
            const min = q1 - 1.5 * iqr;
            const max = q3 + 1.5 * iqr;
            return {
                key: d["key"],
                min: min,
                q1: q1,
                median: median,
                q3: q3,
                max: max,
                iqr: iqr,
            };
        });

        const xScale = d3.scaleBand()
            .domain(groupedData.keys())
            .range([0, width])
            .paddingInner(1)
            .paddingOuter(.5);

        const yScale = d3.scaleLinear()
            .domain([3.1, d3.max(d3.map(data, d => d["App GPA"]))])
            .range([height, 0]);

        svg.selectAll("lines")
            .data(iqrData)
            .enter()
            .append("line")
            .attr("x1", d => xScale(d["key"]))
            .attr("y1", d => yScale(d["min"]))
            .attr("x2", d => xScale(d["key"]))
            .attr("y2", d => yScale(d["max"]))
            .attr("stroke", "Black")
            .attr("stroke-width", 2.5)
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .delay((d, i) => i * 50)
            .style("opacity", 1);

        const boxWidth = 50;

        svg.selectAll("rect")
            .data(iqrData)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d["key"]) - boxWidth / 2)
            .attr("y", d => yScale(d["q3"]))
            .attr("width", boxWidth)
            .attr("height", d => yScale(d["q1"]) - yScale(d["q3"]))
            .attr("fill", "Blue")
            .attr("stroke", "Black")
            .transition()
            .duration(100)
            .style("opacity", 0)
            .transition()
            .duration(100)
            .delay((d, i) => i * 50)
            .style("opacity", 1);


        svg.selectAll("medianLine")
            .data(iqrData)
            .enter()
            .append("line")
            .attr("x1", d => xScale(d["key"]) - boxWidth / 2)
            .attr("y1", d => yScale(d["median"]))
            .attr("x2", d => xScale(d["key"]) + boxWidth / 2)
            .attr("y2", d => yScale(d["median"]))
            .attr("stroke", "Red")
            .attr("stroke-width", 2.5)
            .transition()
            .duration(100)
            .style("opacity", 0)
            .transition()
            .duration(100)
            .delay((d, i) => i * 50)
            .style("opacity", 1);

        const xAxis = d3.axisBottom(xScale);

        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left / 2)
            .attr("x", -height / 2)
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .text("App ENR Total");

        svg.append("g")
            .call(xAxis)
            .attr("transform", "translate(0, " + height + ")")
            .append("text")
            .attr("x", width / 2)
            .attr("y", margin.bottom / 2)
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .text("Type");
    });
};











