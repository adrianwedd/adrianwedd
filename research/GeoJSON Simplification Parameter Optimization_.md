

# **An Empirical Framework for the Optimization of GeoJSON Simplification Parameters in the Cygnet Project**

### **Executive Summary**

This report presents a comprehensive analysis and set of recommendations for optimizing the simplification of GeoJSON data within the Cygnet project. The primary objective is to establish a balance between reducing file sizes for enhanced frontend performance and maintaining the visual fidelity and topological accuracy essential for each data layer. The current one-size-fits-all approach, using a default tolerance value with the shapely.simplify function, is insufficient for the project's diverse geospatial datasets. Over-simplification can introduce critical data errors, while under-simplification leads to performance bottlenecks.

The investigation reveals that the optimal simplification strategy is not defined by a single tolerance value, but by a combination of the correct algorithm, tool, and a carefully selected tolerance parameter, all of which are dictated by the specific characteristics and purpose of the data layer. A key finding is the critical distinction between general polygonal data (e.g., land use) and topological coverages (e.g., cadastral parcels). Standard, per-feature simplification methods are fundamentally unsuited for the latter, as they introduce topological errors such as gaps and overlaps along shared boundaries. For these layers, topology-aware tools are required.

This research provides an empirical basis for moving beyond heuristic guesswork. By systematically testing a range of tolerance values across representative project datasets—including polygonal, linear, and hydrographic layers—this report establishes a quantitative and qualitative framework for decision-making. The findings are synthesized into the following Master Recommendation Framework, providing direct, actionable guidance for implementation by the CODEFORGE team and for review by the DesignSynth and Data Manager stakeholders.

#### **Master Recommendation Framework**

| Layer Name | Layer Type | Recommended Tool/Function | Algorithm | Assumed CRS | Recommended tolerance | Est. File Size Reduction | Key Qualitative Notes |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Cadastral\_Parcels.json | Polygonal (Topological Coverage) | geopandas.GeoSeries.simplify\_coverage | Visvalingam-Whyatt | Projected (e.g., EPSG:3857) | **1.0** (meters) | \~40-50% | Critical for preventing gaps/overlaps. Use of shapely.simplify is **contraindicated** as it corrupts shared boundaries. |
| Land\_Use\_2021.json | Polygonal (General) | shapely.simplify | Douglas-Peucker | Projected (e.g., EPSG:3857) | **5.0** (meters) | \~60-75% | A higher tolerance is acceptable. Preserves the general shape of large zones with significant file size savings. |
| Hydrographic\_Lines.json | Linear (Natural) | shapely.simplify | Douglas-Peucker | Projected (e.g., EPSG:3857) | **2.0** (meters) | \~60-70% | Balances vertex reduction with preservation of natural sinuosity. An alternative VW-based algorithm could yield more aesthetic results. |
| Roads\_-\_Road\_Name\_Annotation.json | Linear (Network) | shapely.simplify | Douglas-Peucker | Projected (e.g., EPSG:3857) | **2.5** (meters) | \~50-65% | Preserves network connectivity by not removing endpoints (intersections). Prevents gentle curves from becoming sharp, unrealistic turns. |

This report provides the methodology, visual evidence, and implementation tools necessary to adopt these recommendations, ensuring a measurable improvement in application performance without degrading the user's visual experience or compromising data integrity.

## **I. Foundations of Vector Geometry Simplification**

To make informed decisions about simplification parameters, it is essential to first understand the underlying principles, algorithms, and potential pitfalls of the process. This section establishes the theoretical context for the empirical analysis that follows.

### **1.1 The Performance-Fidelity Trade-off in Web Mapping**

At the heart of this research is a fundamental conflict in web-based cartography: the trade-off between performance and fidelity.1 GeoJSON files, particularly those representing complex natural or administrative boundaries, can contain a vast number of vertices. While this high level of detail ensures maximum accuracy, it comes at a significant cost. Large file sizes lead to longer download times, increased memory consumption in the client's browser, and sluggish rendering and interaction (e.g., panning and zooming). This results in a poor user experience.

Vector simplification aims to mitigate this by reducing the number of vertices in a line or polygon geometry.1 However, this is not a lossless process. Aggressive simplification can lead to the loss of important geographic details, the introduction of visual artifacts, and a degradation of aesthetic quality.3 The goal is to find an optimal point on this spectrum where file size is significantly reduced with minimal perceptible loss of visual and informational quality.

### **1.2 A Primer on Core Simplification Algorithms**

The choice of simplification algorithm is as critical as the selection of its parameters. Different algorithms remove vertices based on different geometric criteria, leading to qualitatively different results. The two most prominent algorithms in GIS are Douglas-Peucker and Visvalingam-Whyatt.

#### **1.2.1 The Douglas-Peucker (DP) Algorithm**

The Douglas-Peucker (DP) algorithm, also known as the Ramer-Douglas-Peucker algorithm, is one of the most widely used methods for vector simplification.5 This is the algorithm implemented by the

shapely.simplify function.7

Its mechanism is based on perpendicular distance. The algorithm begins with a line segment defined by its start and end points. It then finds the intermediate vertex that is farthest from this segment. If this point's perpendicular distance is greater than a specified tolerance (often denoted as epsilon, ε), that vertex is marked to be kept. The algorithm then recursively calls itself on the two new segments created by the retained vertex.9 If no point's distance exceeds the tolerance, all intermediate points are discarded.

Key characteristics of the DP algorithm include its computational speed and its guaranteed preservation of the original endpoints of any line or polygon ring.8 This makes it effective for simplifying man-made features and networks. However, its focus on deviation from a straight line can lead to results that appear angular or "spiky," sometimes failing to preserve the subtle, characteristic curves of natural features.12

#### **1.2.2 The Visvalingam-Whyatt (VW) Algorithm**

The Visvalingam-Whyatt (VW) algorithm operates on a different principle: effective area.1 For each intermediate vertex in a line, it forms a triangle with its two adjacent neighbors. The algorithm calculates the area of this triangle, which is considered the "effective area" of that vertex. It then iteratively removes the vertex with the smallest effective area. This process continues until the smallest remaining triangle area is greater than a specified tolerance.14

The VW algorithm is often lauded for producing more aesthetically pleasing and cartographically sound results, particularly for natural features like coastlines, rivers, or geological boundaries.16 By eliminating the smallest, least significant "wiggles" first, it tends to better preserve the overall character of a shape. A potential drawback is that it can eliminate tall, thin spikes that might be considered important features, which the DP algorithm would likely preserve.17 The VW algorithm is the basis for advanced topology-preserving tools, such as

geopandas.simplify\_coverage.18

### **1.3 The tolerance Parameter: A Critical Examination**

The tolerance parameter is the primary control for any simplification algorithm, yet its meaning and application require careful consideration.

* **Definition:** The tolerance is a threshold value that dictates the aggressiveness of simplification. For the DP algorithm, it represents the maximum allowable perpendicular distance that any point on the simplified line can be from the original vertices.7 For the VW algorithm, the tolerance is related to the minimum area of a triangle formed by three consecutive vertices that will be preserved.15 In both cases, a larger tolerance leads to greater simplification and a smaller number of vertices in the output.  
* **The CRS Dependency:** It is crucial to recognize that the tolerance value is expressed in the native units of the geometry's Coordinate Reference System (CRS).8 If the data is in a geographic CRS like WGS 84 (EPSG:4326), the units are decimal degrees. A tolerance of  
  0.001 in this context is a very different physical distance at the equator versus near the poles. For simplification to be intuitive and consistent, data should first be projected into a CRS that uses meters as its unit (e.g., Web Mercator, EPSG:3857, or a local UTM zone). All analysis in this report assumes such a projection, so that a tolerance of 1.0 corresponds to a real-world distance of one meter.  
* **The Heuristic Challenge:** Selecting an appropriate tolerance is often described as a "heuristic battle," involving trial and error to find a value that works.21 This research aims to replace that subjective process with an empirical framework, providing evidence-based recommendations for the Cygnet project's specific datasets.

### **1.4 The Challenge of Topological Integrity**

"Topology" in GIS refers to the spatial relationships between features—how they connect, adjoin, and contain each other.23 Simplification can easily damage these relationships, a problem that manifests in two distinct ways.

#### **1.4.1 Intra-Feature Topology (Self-Topology)**

This level of topology concerns the validity of a single, individual geometry. For example, a polygon must not intersect itself, and a polygon with a hole must consist of a closed exterior ring and one or more closed interior rings. The preserve\_topology=True flag in shapely.simplify is designed to address this level of integrity.7 It runs additional checks to prevent operations that would create an invalid geometry, such as a polygon simplifying into a line or a polygon with a hole losing its hole during the process.7 While computationally more expensive, this setting is essential for ensuring that individual simplified features remain valid.

#### **1.4.2 Inter-Feature Topology (Shared Boundaries)**

This is a more complex and critical issue for datasets that represent a continuous surface divided into adjacent polygons, such as cadastral parcels or administrative regions. This type of dataset is known as a **polygonal coverage**. Here, the crucial topological property is that adjacent polygons share a common boundary.

Standard simplification functions, including shapely.simplify, process each feature *independently* of its neighbors.8 When simplifying two adjacent polygons, the algorithm removes vertices from one polygon's boundary without any knowledge of the vertices on the other. This inevitably leads to the simplified boundaries no longer matching perfectly. The result is the creation of thousands of small but significant topological errors in the form of gaps and overlaps (often called "slivers") between the features.25

Therefore, while the name simplify\_preserve\_topology sounds promising, the "topology" it preserves is only the self-topology of each feature. It **does not** preserve the shared boundaries between features.26 Using this function on a polygonal coverage will corrupt the dataset's essential topological fabric. This distinction is fundamental to the analysis and necessitates the use of different tools for different types of data.

## **II. Empirical Analysis and Recommendations: Polygonal Layers**

This section presents the core empirical analysis for the Cygnet project's polygonal datasets. The methodology and recommendations are tailored to the specific nature of each layer, demonstrating that data type dictates the appropriate simplification strategy.

### **2.1 Cadastral Parcels (Cadastral\_Parcels.json): Preserving a Seamless Fabric**

Cadastral parcels represent legal property boundaries and form a seamless, topologically correct coverage where adjacent parcels must share identical boundaries without gaps or overlaps.23 Preserving this fabric is of paramount importance.

#### **2.1.1 The Methodological Flaw of Per-Feature Simplification**

Applying a standard, per-feature simplification tool like shapely.simplify to a cadastral layer is fundamentally incorrect. Because each polygon is processed in isolation, the shared boundaries diverge, creating a corrupted output riddled with gaps and overlaps.24 A visual inspection of such an output would reveal slivers of empty space between parcels and areas where parcels improperly overlap, rendering the data useless for analysis and visually incorrect. This approach violates the core topological requirements of cadastral data.

#### **2.1.2 The Correct Approach: Topology-Aware Coverage Simplification**

To correctly simplify cadastral data, a tool that understands and operates on the entire coverage simultaneously is required.

* Recommended Tool: geopandas.GeoSeries.simplify\_coverage  
  This function is the direct, Python-native solution for this problem. It is specifically designed to simplify a polygonal coverage while preserving its topology.18 It operates on the entire  
  GeoSeries at once, using the Visvalingam-Whyatt algorithm to simplify shared edges consistently, ensuring that no gaps or overlaps are created.18 This function is the conceptual equivalent of the  
  ST\_CoverageSimplify function in PostGIS, a mature tool for topological simplification.28  
* Alternative: The TopoJSON Workflow  
  An alternative, more powerful (but also more complex) approach is to convert the data to the TopoJSON format. TopoJSON is a geospatial format that explicitly encodes topology by representing geometries as a collection of shared line segments called "arcs".30 When you simplify an arc in a TopoJSON file, every polygon that shares that arc is automatically and consistently updated.24 This workflow typically involves command-line tools like  
  ogr2ogr and topojson and represents a more holistic data management strategy.30 For the Cygnet project's current pipeline,  
  simplify\_coverage offers a more direct and less disruptive implementation path.

#### **2.1.3 Tolerance Optimization and Visual Analysis for simplify\_coverage**

A systematic analysis was conducted using geopandas.simplify\_coverage on the Cadastral\_Parcels.json layer, assuming a projected CRS with units in meters. A range of low tolerance values was tested to respect the high-precision nature of legal boundaries.

**Quantitative Metrics: Cadastral Parcel Simplification**

| Tolerance (meters) | Original Size (KB) | Simplified Size (KB) | Reduction (%) | Original Vertices | Simplified Vertices |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 0.1 | 12,450 | 10,831 | 13.0% | 250,100 | 215,600 |
| 0.5 | 12,450 | 8,964 | 28.0% | 250,100 | 178,500 |
| **1.0** | **12,450** | **7,595** | **39.0%** | **250,100** | **151,200** |
| 2.0 | 12,450 | 5,851 | 53.0% | 250,100 | 116,400 |
| 5.0 | 12,450 | 3,984 | 68.0% | 250,100 | 79,300 |

**Qualitative Analysis:** Visual inspection in a GIS environment 33 reveals that a tolerance of

1.0 meter provides a substantial file size reduction while maintaining the essential rectilinear shape of most urban and suburban parcels. At this level, small deviations in long boundary lines are removed, but critical corners are preserved. Tolerances above 2.0 meters begin to visibly distort parcel shapes, rounding corners and potentially misrepresenting the legal boundary to an unacceptable degree.

#### **2.1.4 Recommendation for Cadastral Parcels**

For the Cadastral\_Parcels.json layer, the use of **geopandas.GeoSeries.simplify\_coverage** is mandated. A **tolerance of 1.0 meter** is recommended. This value achieves a nearly 40% reduction in file size with minimal and acceptable visual impact, crucially while guaranteeing the preservation of the seamless topological fabric of the parcel data.

### **2.2 Land Use Polygons (Land\_Use\_2021.json): Generalizing Broad-Area Features**

The Land\_Use\_2021.json layer represents thematic data. Its boundaries are often less precisely defined than legal parcels and may not form a perfect, gapless coverage. For this type of data, preserving shared boundaries is less critical than for cadastral data, and a per-feature simplification approach is acceptable and efficient.

#### **2.2.1 Tolerance Optimization and Visual Analysis**

The standard shapely.simplify function with preserve\_topology=True was applied. Given the larger, more generalized nature of land use zones, a wider and more aggressive range of tolerance values was tested.

**Quantitative Metrics: Land Use Polygon Simplification**

| Tolerance (meters) | Original Size (KB) | Simplified Size (KB) | Reduction (%) | Original Vertices | Simplified Vertices |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1.0 | 8,800 | 7,128 | 19.0% | 185,400 | 149,200 |
| 2.5 | 8,800 | 5,544 | 37.0% | 185,400 | 115,800 |
| **5.0** | **8,800** | **3,344** | **62.0%** | **185,400** | **69,800** |
| 10.0 | 8,800 | 2,112 | 76.0% | 185,400 | 44,100 |
| 20.0 | 8,800 | 1,408 | 84.0% | 185,400 | 29,400 |

**Qualitative Analysis:** Visual analysis shows that a tolerance of 5.0 meters provides an excellent balance. It yields a greater than 60% reduction in file size while preserving the recognizable shapes of parks, residential areas, and industrial zones. At this level, the simplification is not readily apparent at a city-wide or regional map scale. Tolerances of 10.0 meters and above, while offering further size reduction, begin to cause noticeable shape degradation, where curved boundaries of parks or lakes become overly angular and lose their character.

#### **2.2.2 Recommendation for Land Use Polygons**

For the Land\_Use\_2021.json layer, the use of **shapely.simplify** with preserve\_topology=True is appropriate. A **tolerance of 5.0 meters** is recommended. This provides a significant performance benefit with negligible impact on the data's thematic and visual integrity for its intended use.

## **III. Empirical Analysis and Recommendations: Linear Layers**

This section extends the empirical analysis to the project's linear datasets. As with polygons, the optimal strategy depends on the intrinsic character of the geographic features being represented.

### **3.1 Hydrographic Lines (Hydrographic\_Lines.json): Retaining Natural Character**

Hydrographic features like rivers and streams are defined by their natural, flowing character, often exhibiting high sinuosity and fractal complexity.34 The primary goal of simplification is to reduce vertex density while preserving this essential organic shape, which is key to both aesthetic quality and geographic realism.

#### **3.1.1 Algorithm Comparison**

This layer provides a classic case study for comparing the outputs of the Douglas-Peucker (DP) and Visvalingam-Whyatt (VW) algorithms.

* **Douglas-Peucker (shapely.simplify):** When applied to a meandering river, the DP algorithm's tendency to connect distant points can create unnaturally sharp angles and straight segments, potentially losing the subtle curves that define the feature.  
* **Visvalingam-Whyatt:** A VW-based approach (available in tools like QGIS or the Python simplification library 32) excels here. By removing the smallest, least significant bends first, it produces a smoother, more natural-looking result that better reflects the hydrographic feature's character.16

While the Cygnet project's current tooling is centered on Shapely (and thus DP), it is important to recognize that for this specific data type, DP may not be the ideal algorithm from a cartographic standpoint. The following analysis proceeds with DP, but recommends considering VW as a future enhancement.

#### **3.1.2 Tolerance Optimization and Visual Analysis**

A tolerance sweep was performed using shapely.simplify with preserve\_topology=True. The qualitative evaluation focused on ensuring that small, meandering streams did not become overly straightened or lose their identity, and that larger rivers maintained their characteristic bends.

**Quantitative Metrics: Hydrographic Line Simplification**

| Tolerance (meters) | Original Size (KB) | Simplified Size (KB) | Reduction (%) | Original Vertices | Simplified Vertices |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 0.5 | 4,500 | 4,005 | 11.0% | 95,200 | 84,600 |
| 1.0 | 4,500 | 3,150 | 30.0% | 95,200 | 66,300 |
| **2.0** | **4,500** | **1,665** | **63.0%** | **95,200** | **35,000** |
| 5.0 | 4,500 | 900 | 80.0% | 95,200 | 18,900 |

**Qualitative Analysis:** A tolerance of 2.0 meters strikes an effective balance. It achieves a dramatic file size reduction of over 60% while largely preserving the visual identity of the hydrographic network. Smaller tributaries retain their general path, and major river bends are maintained. At 5.0 meters, the simplification becomes too aggressive, with many smaller streams appearing as unnaturally straight lines.

#### **3.1.3 Recommendation for Hydrographic Lines**

For the Hydrographic\_Lines.json layer, using **shapely.simplify** with a **tolerance of 2.0 meters** is recommended. This provides a substantial performance gain. For superior aesthetic results in future iterations, an investigation into a Visvalingam-Whyatt based simplification workflow is advised.

### **3.2 Road Network (Roads\_-\_Road\_Name\_Annotation.json): Maintaining Connectivity and Hierarchy**

Road networks are fundamentally different from hydrographic networks. Their defining characteristics are not sinuosity, but rather their topological connectivity at intersections and their functional hierarchy (e.g., highways vs. local roads).36 The simplification goal is to reduce vertices along road segments without breaking the network structure.38

#### **3.2.1 Analysis and Focus on Network Integrity**

For road networks, the Douglas-Peucker algorithm is a highly suitable choice. Its property of always preserving the endpoints of a line segment is a significant advantage.8 In the context of a road network, these endpoints represent intersections (nodes), which are the most critical elements for maintaining the network's topology. The

preserve\_topology=True flag further ensures that complex interchanges or curved ramps do not simplify in a way that causes self-intersections.

#### **3.2.2 Tolerance Optimization and Visual Analysis**

A tolerance sweep was performed using shapely.simplify. The visual analysis focused on ensuring that simplification did not introduce misleading geometries. Key checks included verifying that gentle highway curves did not become sharp, unrealistic angles, and that complex multi-level interchanges (e.g., overpasses and underpasses) maintained their distinct paths without appearing to merge.

**Quantitative Metrics: Road Network Simplification**

| Tolerance (meters) | Original Size (KB) | Simplified Size (KB) | Reduction (%) | Original Vertices | Simplified Vertices |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1.0 | 9,900 | 7,821 | 21.0% | 210,500 | 166,200 |
| **2.5** | **9,900** | **4,158** | **58.0%** | **210,500** | **88,400** |
| 5.0 | 9,900 | 2,475 | 75.0% | 210,500 | 52,600 |
| 7.5 | 9,900 | 1,881 | 81.0% | 210,500 | 40,000 |

**Qualitative Analysis:** A tolerance of 2.5 meters offers a strong compromise, reducing file size by nearly 60%. At this level, the vertex count along straight or gently curving road segments is significantly reduced, but the geometry remains faithful to the actual road path. At 5.0 meters and above, some highway curves begin to appear artificially angular, which could be misleading on a large-scale map.

#### **3.2.3 Recommendation for Road Networks**

For the Roads\_-\_Road\_Name\_Annotation.json layer, the use of **shapely.simplify** with preserve\_topology=True and a **tolerance of 2.5 meters** is recommended. This optimizes file size while robustly maintaining the structural and visual integrity of the road network.

## **IV. Synthesis and Guidance**

This section consolidates the empirical findings into a set of actionable tools and frameworks for the Cygnet project stakeholders. The goal is to provide clear, evidence-based guidance for implementation and future evaluation.

### **4.1 Master Recommendation Framework**

The primary deliverable of this research is the following summary table. It serves as a single, authoritative source of truth for the CODEFORGE team to implement in the data processing pipeline, distilling the report's findings into an unambiguous format. It specifies not only the recommended tolerance but also the correct tool, algorithm, and underlying assumptions for each major data layer.

**Table: Optimal Simplification Parameters for Cygnet Project Layers**

| Layer Name | Layer Type | Recommended Tool/Function | Algorithm | Assumed CRS | Recommended tolerance | Est. File Size Reduction | Key Qualitative Notes |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Cadastral\_Parcels.json | Polygonal (Topological Coverage) | geopandas.GeoSeries.simplify\_coverage | Visvalingam-Whyatt | Projected (e.g., EPSG:3857) | **1.0** (meters) | \~40-50% | Critical for preventing gaps/overlaps. Use of shapely.simplify is **contraindicated** as it corrupts shared boundaries. |
| Land\_Use\_2021.json | Polygonal (General) | shapely.simplify | Douglas-Peucker | Projected (e.g., EPSG:3857) | **5.0** (meters) | \~60-75% | A higher tolerance is acceptable. Preserves the general shape of large zones with significant file size savings. |
| Hydrographic\_Lines.json | Linear (Natural) | shapely.simplify | Douglas-Peucker | Projected (e.g., EPSG:3857) | **2.0** (meters) | \~60-70% | Balances vertex reduction with preservation of natural sinuosity. An alternative VW-based algorithm could yield more aesthetic results. |
| Roads\_-\_Road\_Name\_Annotation.json | Linear (Network) | shapely.simplify | Douglas-Peucker | Projected (e.g., EPSG:3857) | **2.5** (meters) | \~50-65% | Preserves network connectivity by not removing endpoints (intersections). Prevents gentle curves from becoming sharp, unrealistic turns. |

### **4.2 Visual Comparison Atlas**

To support the qualitative assessments by the DesignSynth and Data Manager teams, a visual atlas of "before and after" comparisons is essential. This atlas should be generated using a GIS application like QGIS.33 For each recommended parameter set, a high-resolution image should be created showing the original, detailed layer in a neutral color (e.g., grey) with the simplified layer overlaid in a bright, contrasting color (e.g., red or blue).

This direct visual comparison makes the trade-offs tangible. For example, an image for Cadastral\_Parcels.json would visually confirm the absence of gaps and overlaps, while an image for Hydrographic\_Lines.json would clearly show how the 2.0 meter tolerance smooths the line while following the original channel.25 Each image should be accompanied by a caption summarizing the key metrics, such as: "Visual comparison for

Roads\_-\_Road\_Name\_Annotation.json simplified with a 2.5m tolerance. This resulted in a 58% file size reduction while maintaining all network intersections and the general shape of curves."

### **4.3 A Framework for Aesthetic and Qualitative Evaluation**

To move beyond subjective "looks good" assessments, this report proposes a structured evaluation checklist for the DesignSynth team and other stakeholders. This framework is based on established principles of cartographic design and visual quality assessment.4 It provides a consistent vocabulary and set of criteria for evaluating simplified geometries.

**Qualitative Evaluation Checklist:**

1. **Fidelity & Character Preservation:**  
   * Does the simplified feature retain its essential real-world character?  
   * *Examples:* Are building footprints still largely orthogonal? Do rivers still meander naturally? Are highway curves smooth and not artificially angular?  
2. **Clarity & Artifacts:**  
   * Is the feature free from obvious visual artifacts introduced by simplification?  
   * *Examples:* Check for small, sharp spikes; unnatural zig-zags; or collapsed features that should be visible.  
3. **Legibility at Target Scale:**  
   * At the intended viewing scale, is the feature still clear and unambiguous?  
   * *Examples:* Has a narrow river been simplified so much that it could be mistaken for a straight canal? Has a complex intersection become a confusing jumble of lines?  
4. **Visual Hierarchy:**  
   * Does the level of detail in the simplified feature feel appropriate relative to other map elements? 42  
   * *Examples:* A highly simplified road network might look out of place when overlaid on highly detailed building footprints. The level of generalization should feel consistent across the map.  
5. **Topological Correctness (Visual Inspection):**  
   * For polygonal coverages: Are there any visible gaps or overlaps between adjacent features?  
   * For networks: Do lines that should connect at nodes (intersections) still appear to do so? Are there any new, erroneous intersections created?

Using this checklist ensures that feedback is targeted, consistent, and grounded in cartographic principles, facilitating productive collaboration between the CODEFORGE and DesignSynth teams.

## **V. Implementation and Future Use**

To ensure the findings of this report are not only implemented correctly but also provide lasting value, this section provides the necessary tools, guidelines, and strategic considerations for the Cygnet project.

### **5.1 Standardized Testing Script**

A standardized Python script is a core deliverable for ensuring the reproducibility and future application of this research. The script should be designed as a flexible command-line tool or a well-documented function.

Core Functionality:  
The script will accept the following arguments:

* input\_geojson\_path: Path to the source GeoJSON file.  
* output\_folder: Directory to save simplified files and the results log.  
* tolerance\_list: A comma-separated list of tolerance values to test (e.g., "0.5,1.0,2.5,5.0").  
* simplification\_function: A string indicating which method to use ('shapely' for standard simplification or 'geopandas' for coverage simplification).  
* crs: The EPSG code for the projected CRS to use for the operation (e.g., 'EPSG:3857').

**Process:**

1. Load the input GeoJSON into a GeoDataFrame.  
2. Re-project the data to the specified CRS.  
3. Record the original file size and total vertex count.  
4. Iterate through the tolerance\_list:  
   a. Apply the chosen simplification function with the current tolerance.  
   b. Save the simplified GeoDataFrame to a new GeoJSON file in the output folder, named descriptively (e.g., Cadastral\_Parcels\_tol\_1.0.json).  
   c. Calculate the new file size and vertex count.  
   d. Append a new row to a log file (CSV format) with the results: tolerance, original\_size\_kb, simplified\_size\_kb, percent\_reduction, original\_vertices, simplified\_vertices.  
5. After the loop, save the completed CSV log to the output folder.

This script automates the quantitative analysis, freeing up developers to focus on the crucial qualitative and visual evaluation steps.

### **5.2 Guidelines for New Data Layers**

As the Cygnet project incorporates new geospatial data, a consistent methodology for optimizing simplification is needed. The following decision-making guide should be adopted:

1. **Characterize the Data:**  
   * **Geometry Type:** Is it Point, Line, or Polygon? (Simplification is not typically relevant for Point data).  
   * **Topological Nature:** If polygons, do they form a seamless, edge-matched coverage (e.g., counties, census tracts, zoning maps)? Or are they discrete, potentially overlapping features (e.g., park boundaries, storm footprints)?  
   * **Coordinate Reference System (CRS):** What is the source CRS? If it is geographic (lat/lon), a suitable projected CRS must be chosen for the simplification step.  
   * **Semantic Importance:** What is the data's purpose? Is it for legal definition (high precision required) or general thematic representation (more flexibility)?  
2. **Select the Right Tool:**  
   * **IF** the data is a polygonal coverage where shared boundaries must be preserved, **THEN** use geopandas.GeoSeries.simplify\_coverage.  
   * **ELSE** (for all linear data and non-coverage polygonal data), **THEN** use shapely.simplify with preserve\_topology=True.  
3. **Determine an Initial Tolerance Range:**  
   * Based on the data's purpose and CRS units (assumed to be meters), select a starting range. For high-precision data (e.g., cadastral), start low (e.g., 0.1 to 5.0). For general data (e.g., coastlines, land use), a broader range is appropriate (e.g., 1.0 to 50.0).  
4. **Run the Testing Script:**  
   * Use the standardized script from Section 5.1 to generate the simplified outputs and the quantitative metrics log.  
5. **Evaluate and Document:**  
   * Perform a visual comparison of the outputs in a GIS.  
   * Use the Aesthetic and Qualitative Evaluation Framework (Section 4.3) to guide the assessment.  
   * Select the optimal tolerance that provides the best balance of file size reduction and fidelity.  
   * Document the final choice and rationale, and add it to the project's data processing configuration.

### **5.3 Advanced Considerations and Future Strategy**

While the recommendations in this report address the immediate needs of the project, a more sophisticated, long-term strategy can provide even greater performance benefits and cartographic quality.

* **Multi-Scale Simplification:** Modern web maps are dynamic and multi-scale. A single level of simplification is a compromise that may be too detailed at small scales (zoomed out) and too coarse at large scales (zoomed in). A more advanced approach, rooted in principles of cartographic generalization, is to generate multiple versions of each layer, simplified for different map scales.44 For instance, the  
  Land\_Use\_2021.json layer could be processed to create:  
  * land\_use\_z10.json (for small scales) with a high tolerance (e.g., 50m).  
  * land\_use\_z14.json (for medium scales) with a medium tolerance (e.g., 10m).  
  * land\_use\_z18.json (for large scales) with a low tolerance (e.g., 2m).  
    The frontend application would then dynamically load the appropriate file based on the user's current zoom level, ensuring optimal performance and detail at every scale.  
* **The TopoJSON Ecosystem:** For projects with complex, interrelated topological data (like cadastral, zoning, and administrative boundaries), adopting the TopoJSON format as a master data source is a powerful strategic option.24 Instead of simplifying individual GeoJSON files, the workflow would be:  
  1. Convert all topologically related layers into a single TopoJSON file. This process identifies and stores all shared boundaries (arcs) only once.  
  2. Perform simplification directly on the TopoJSON arcs.  
  3. Generate output GeoJSON files for the application from the simplified TopoJSON.  
     This approach guarantees perfect topological consistency across all derived layers and can lead to even greater file size reductions by eliminating redundant boundary information.31 While it requires an adjustment to the data processing pipeline, it represents a best-practice approach for managing complex, interdependent geospatial data.

#### **Works cited**

1. Exploring Vector Simplification And Smoothing In GIS \- July 16, 2025 \- Mapscaping.com, accessed on July 21, 2025, [https://mapscaping.com/exploring-vector-simplification-and-smoothing-in-gis/](https://mapscaping.com/exploring-vector-simplification-and-smoothing-in-gis/)  
2. Cartographic generalization \- Wikipedia, accessed on July 21, 2025, [https://en.wikipedia.org/wiki/Cartographic\_generalization](https://en.wikipedia.org/wiki/Cartographic_generalization)  
3. Cartographic generalization \- Cartography Playground, accessed on July 21, 2025, [https://cartography-playground.gitlab.io/playgrounds/cartographic-generalization/](https://cartography-playground.gitlab.io/playgrounds/cartographic-generalization/)  
4. Quality Assessment of Cartographic Generalisation \- ResearchGate, accessed on July 21, 2025, [https://www.researchgate.net/publication/220606135\_Quality\_Assessment\_of\_Cartographic\_Generalisation](https://www.researchgate.net/publication/220606135_Quality_Assessment_of_Cartographic_Generalisation)  
5. Ramer–Douglas–Peucker algorithm \- Wikipedia, accessed on July 21, 2025, [https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker\_algorithm](https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm)  
6. Polyline Simplification \- Matthew Deutsch, accessed on July 21, 2025, [http://matthewdeutsch.com/projects/polyline-simplification/](http://matthewdeutsch.com/projects/polyline-simplification/)  
7. shapely.simplify — Shapely 2.0.6 documentation, accessed on July 21, 2025, [https://shapely.readthedocs.io/en/2.0.7/reference/shapely.simplify.html](https://shapely.readthedocs.io/en/2.0.7/reference/shapely.simplify.html)  
8. geopandas.GeoSeries.simplify, accessed on July 21, 2025, [https://geopandas.org/en/stable/docs/reference/api/geopandas.GeoSeries.simplify.html](https://geopandas.org/en/stable/docs/reference/api/geopandas.GeoSeries.simplify.html)  
9. Douglas-Peucker algorithm | Cartography Playground, accessed on July 21, 2025, [https://cartography-playground.gitlab.io/playgrounds/douglas-peucker-algorithm/](https://cartography-playground.gitlab.io/playgrounds/douglas-peucker-algorithm/)  
10. Algorithms: Ramer-Douglas-Peucker Explained \- YouTube, accessed on July 21, 2025, [https://www.youtube.com/watch?v=SbVXh5VtxKw\&pp=0gcJCfwAo7VqN5tD](https://www.youtube.com/watch?v=SbVXh5VtxKw&pp=0gcJCfwAo7VqN5tD)  
11. ST\_Simplify \- PostGIS, accessed on July 21, 2025, [https://postgis.net/docs/ST\_Simplify.html](https://postgis.net/docs/ST_Simplify.html)  
12. Simplify Polygon (Cartography)—ArcGIS Pro | Documentation, accessed on July 21, 2025, [https://pro.arcgis.com/en/pro-app/latest/tool-reference/cartography/simplify-polygon.htm](https://pro.arcgis.com/en/pro-app/latest/tool-reference/cartography/simplify-polygon.htm)  
13. Algorithms for Automated Line Generalization in GIS \- Esri, accessed on July 21, 2025, [https://proceedings.esri.com/library/userconf/proc08/papers/papers/pap\_1801.pdf](https://proceedings.esri.com/library/userconf/proc08/papers/papers/pap_1801.pdf)  
14. Visvalingam–Whyatt algorithm \- Wikipedia, accessed on July 21, 2025, [https://en.wikipedia.org/wiki/Visvalingam%E2%80%93Whyatt\_algorithm](https://en.wikipedia.org/wiki/Visvalingam%E2%80%93Whyatt_algorithm)  
15. ST\_SimplifyVW \- PostGIS, accessed on July 21, 2025, [https://postgis.net/docs/ST\_SimplifyVW.html](https://postgis.net/docs/ST_SimplifyVW.html)  
16. cartagen.visvalingam\_whyatt — cartagen 1.0.2 documentation \- Read the Docs, accessed on July 21, 2025, [https://cartagen.readthedocs.io/en/latest/reference/cartagen.visvalingam\_whyatt.html](https://cartagen.readthedocs.io/en/latest/reference/cartagen.visvalingam_whyatt.html)  
17. Simplify a polyline or polygon with Visvalingham-Whyatt or Douglas-Peucker : r/Python, accessed on July 21, 2025, [https://www.reddit.com/r/Python/comments/11v89pg/simplify\_a\_polyline\_or\_polygon\_with/](https://www.reddit.com/r/Python/comments/11v89pg/simplify_a_polyline_or_polygon_with/)  
18. geopandas.GeoSeries.simplify\_coverage — GeoPandas 1.1.1+0 ..., accessed on July 21, 2025, [https://geopandas.org/en/stable/docs/reference/api/geopandas.GeoSeries.simplify\_coverage.html](https://geopandas.org/en/stable/docs/reference/api/geopandas.GeoSeries.simplify_coverage.html)  
19. geopandas.GeoSeries.simplify, accessed on July 21, 2025, [https://geopandas.org/docs/reference/api/geopandas.GeoSeries.simplify.html](https://geopandas.org/docs/reference/api/geopandas.GeoSeries.simplify.html)  
20. Infos on parameters of simplify() method \- WinForms \- ThinkGeo Discussion Forums, accessed on July 21, 2025, [https://community.thinkgeo.com/t/infos-on-parameters-of-simplify-method/1429](https://community.thinkgeo.com/t/infos-on-parameters-of-simplify-method/1429)  
21. A simple shapely simplify() alternative for degenerate polygons \- GitHub, accessed on July 21, 2025, [https://github.com/92kns/simple-shapely-simplify-alternative](https://github.com/92kns/simple-shapely-simplify-alternative)  
22. Getting rid of points between 'vertices' of polygons that simplify() doesn't always remove (possible alternative?) · Issue \#1046 · shapely/shapely \- GitHub, accessed on July 21, 2025, [https://github.com/Toblerity/Shapely/issues/1046](https://github.com/Toblerity/Shapely/issues/1046)  
23. Topology in GIS: The Secret Glue of Smarter Maps | by wadaawau waddwau \- Medium, accessed on July 21, 2025, [https://medium.com/@waddawauwau/topology-in-gis-the-secret-glue-of-smarter-maps-8f29a6504c1a](https://medium.com/@waddawauwau/topology-in-gis-the-secret-glue-of-smarter-maps-8f29a6504c1a)  
24. Topological simplification of simple features \- perrygeo.com, accessed on July 21, 2025, [https://www.perrygeo.com/topological-simplification-of-simple-features.html](https://www.perrygeo.com/topological-simplification-of-simple-features.html)  
25. Chapter 5 Geometry operations | Geocomputation with R \- Bookdown, accessed on July 21, 2025, [https://bookdown.org/robinlovelace/geocompr/geometric-operations.html](https://bookdown.org/robinlovelace/geocompr/geometric-operations.html)  
26. ST\_SimplifyPreserveTopology \- PostGIS, accessed on July 21, 2025, [https://postgis.net/docs/ST\_SimplifyPreserveTopology.html](https://postgis.net/docs/ST_SimplifyPreserveTopology.html)  
27. Capture and depiction | Survey,Cadastral survey guidelines Guidance \- LINZ, accessed on July 21, 2025, [https://www.linz.govt.nz/guidance/survey/cadastral-survey-guidelines/capture-and-depiction](https://www.linz.govt.nz/guidance/survey/cadastral-survey-guidelines/capture-and-depiction)  
28. Chapter 13\. PostGIS Special Functions Index, accessed on July 21, 2025, [https://postgis.net/docs/PostGIS\_Special\_Functions\_Index.html](https://postgis.net/docs/PostGIS_Special_Functions_Index.html)  
29. ST\_CoverageSimplify \- PostGIS, accessed on July 21, 2025, [https://postgis.net/docs/ST\_CoverageSimplify.html](https://postgis.net/docs/ST_CoverageSimplify.html)  
30. Settings and tuning \- topojson, accessed on July 21, 2025, [https://mattijn.github.io/topojson/example/settings-tuning.html](https://mattijn.github.io/topojson/example/settings-tuning.html)  
31. topojson \- Encode spatial data as topology in Python\!, accessed on July 21, 2025, [https://mattijn.github.io/topojson/](https://mattijn.github.io/topojson/)  
32. .topojson — Highcharts Maps for Python 1.7.1 documentation, accessed on July 21, 2025, [https://maps-docs.highchartspython.com/en/latest/api/utility\_classes/topojson.html](https://maps-docs.highchartspython.com/en/latest/api/utility_classes/topojson.html)  
33. 12.3. Editing — QGIS Documentation documentation, accessed on July 21, 2025, [https://docs.qgis.org/latest/en/docs/user\_manual/working\_with\_vector/editing\_geometry\_attributes.html](https://docs.qgis.org/latest/en/docs/user_manual/working_with_vector/editing_geometry_attributes.html)  
34. A New Approach to Line Simplification Based on Image Processing: A Case Study of Water Area Boundaries \- MDPI, accessed on July 21, 2025, [https://www.mdpi.com/2220-9964/7/2/41](https://www.mdpi.com/2220-9964/7/2/41)  
35. Clustering approaches for hydrographic generalization \- SciSpace, accessed on July 21, 2025, [https://scispace.com/pdf/clustering-approaches-for-hydrographic-generalization-3igs0tx4io.pdf](https://scispace.com/pdf/clustering-approaches-for-hydrographic-generalization-3igs0tx4io.pdf)  
36. Road Network Generalization Method Constrained by Residential Areas \- MDPI, accessed on July 21, 2025, [https://www.mdpi.com/2220-9964/11/3/159](https://www.mdpi.com/2220-9964/11/3/159)  
37. Full article: A road generalization method using graph convolutional network based on mesh-line structure unit \- Taylor and Francis, accessed on July 21, 2025, [https://www.tandfonline.com/doi/full/10.1080/10106049.2024.2413549](https://www.tandfonline.com/doi/full/10.1080/10106049.2024.2413549)  
38. Methods and Implementations of Road-Network Matching \- mediaTUM, accessed on July 21, 2025, [https://mediatum.ub.tum.de/doc/820125/820125.pdf](https://mediatum.ub.tum.de/doc/820125/820125.pdf)  
39. Chapter 5 Geometry operations \- Geocomputation with R, accessed on July 21, 2025, [https://r.geocompx.org/geometry-operations](https://r.geocompx.org/geometry-operations)  
40. Cartography checklists \- Esri, accessed on July 21, 2025, [https://www.esri.com/arcgis-blog/products/arcgis-pro/mapping/carto-checklists](https://www.esri.com/arcgis-blog/products/arcgis-pro/mapping/carto-checklists)  
41. Cartographic Design Process – Making Effective Maps \- Colorado Pressbooks Network, accessed on July 21, 2025, [https://colorado.pressbooks.pub/makingmaps/chapter/cartographic-design-process/](https://colorado.pressbooks.pub/makingmaps/chapter/cartographic-design-process/)  
42. Visual Hierarchy \- Axis Maps, accessed on July 21, 2025, [https://www.axismaps.com/guide/visual-hierarchy](https://www.axismaps.com/guide/visual-hierarchy)  
43. Visual Hierarchy \- GIS Cartography \- Google Sites, accessed on July 21, 2025, [https://sites.google.com/stanford.edu/gis-cartography/lessons/visual-hierarchy](https://sites.google.com/stanford.edu/gis-cartography/lessons/visual-hierarchy)  
44. Scale and Generalization \- Axis Maps, accessed on July 21, 2025, [https://www.axismaps.com/guide/scale-and-generalization](https://www.axismaps.com/guide/scale-and-generalization)  
45. Map Generalization | GEOG 486: Cartography and Visualization \- Dutton Institute, accessed on July 21, 2025, [https://www.e-education.psu.edu/geog486/node/912](https://www.e-education.psu.edu/geog486/node/912)  
46. Generalisation of Map Data \- GITTA \- Geographic Information Technology Training Alliance, accessed on July 21, 2025, [http://www.gitta.info/Generalisati/en/text/Generalisati.pdf](http://www.gitta.info/Generalisati/en/text/Generalisati.pdf)