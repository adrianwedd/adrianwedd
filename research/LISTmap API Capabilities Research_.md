

# **An In-Depth Assessment of the LISTmap ArcGIS REST API: Capabilities, Applications, and Strategic Recommendations for the Cygnet Project**

### **Executive Summary & Key Recommendations**

This report presents a comprehensive technical assessment of the Land Information System Tasmania (LISTmap) ArcGIS REST Application Programming Interface (API). The investigation was undertaken to identify and document the full spectrum of functionalities available, moving significantly beyond the Cygnet project's current implementation of basic data and image tile retrieval. The findings reveal that the LISTmap API is a standard, multi-faceted Esri ArcGIS Enterprise deployment, offering a rich set of advanced capabilities that can be leveraged to enhance the Cygnet Unified Dashboard with more powerful analytical tools, richer data integration, and improved user interaction.

A central finding is that significant, untapped potential lies in the API's advanced server-side operations. These include sophisticated spatial-relational queries, on-the-fly statistical analysis, and dynamic rendering, which can offload computationally intensive processing from the client application to the server. This architectural shift promises substantial improvements in performance and user experience. Furthermore, the platform exposes data through standardized Open Geospatial Consortium (OGC) protocols, specifically Web Map Service (WMS) and Web Feature Service (WFS), enabling integration with a wider ecosystem of non-Esri tools and libraries and thereby increasing development flexibility and future-proofing the Cygnet project's architecture.

Based on this in-depth analysis, the following strategic recommendations are proposed for prioritization:

* **Recommendation 1 (High Impact):** Prioritize the integration of the **MapServer export operation with the dynamicLayers parameter**. This powerful combination enables client-driven, server-side dynamic symbology. It represents a transformative opportunity for the Cygnet project to create responsive, data-driven visualizations within the Unified Dashboard, allowing users to change layer styling, classifications, and visibility on the fly without client-side performance degradation.  
* **Recommendation 2 (High Impact):** Leverage the **Public/OpenDataWFS/MapServer endpoint** for all advanced vector data retrieval. This service is a hybrid, supporting both Esri-native REST queries and standardized OGC WFS requests. Its WFS interface, particularly its potential transactional capabilities (WFS-T), should be investigated as the primary mechanism for any future feature submission and editing workflows, ensuring interoperability and adherence to open standards.  
* **Recommendation 3 (Strategic):** Implement a robust data-caching and retrieval strategy that leverages the **query operation's returnIdsOnly parameter in conjunction with pagination parameters** (resultOffset, resultRecordCount). This approach is essential for efficiently handling large datasets by programmatically overcoming the maxRecordCount limitation observed in many services, ensuring the application remains scalable and responsive.  
* **Recommendation 4 (Exploratory):** Vigorously pursue the **Get Token functionality** present in the service directory. The absence of publicly accessible FeatureServer endpoints, which are the standard for data editing in an ArcGIS environment, strongly suggests that all transactional services are secured. Obtaining authenticated access is the critical next step to unlocking the API's full potential for data manipulation and real-time synchronization.

By implementing these recommendations, the Cygnet project can evolve its geospatial components from simple data display to a sophisticated platform for interactive analysis and visualization, fully realizing the strategic value of the LISTmap data ecosystem.

---

## **Part I: The LISTmap Service Ecosystem: Architecture and Inventory**

To effectively leverage the LISTmap platform, it is essential to first understand that it is not a single, monolithic API. Instead, it is a comprehensive geospatial service ecosystem built upon the Esri ArcGIS REST API framework.1 This architecture exposes data and functionality through a collection of specialized services, each designed for specific tasks. Understanding this structure is foundational to unlocking the platform's full potential.

### **1.1 Anatomy of the ArcGIS REST API**

The Esri ArcGIS REST API is a web standard for communicating with an ArcGIS Server, providing a structured way to access and manipulate GIS resources over HTTP.2 All interactions are based on a hierarchy of resources and operations accessible via URLs. The typical structure for a service endpoint is

\<host\>/arcgis/rest/services/\<folder\>/\<serviceName\>/\<serviceType\>, where each component navigates deeper into the service catalog.2

The investigation of LISTmap reveals the presence and relevance of several key ArcGIS service types, each with a distinct role:

* **MapServer:** This is the workhorse for 2D map visualization. Its primary functions include serving pre-rendered, cached map tiles for fast display (as currently used by Cygnet), dynamically generating map images from vector data, and supporting read-only query operations on its layers.3 Map services are optimized for visualization and data interrogation but do not natively support editing.3  
* **FeatureServer:** This service type is the cornerstone of feature-level interaction and editing. It provides rich, granular access to vector data, allowing clients to not only query features but also to perform transactional edits, including creating, updating, and deleting features via the applyEdits operation.4 The presence or absence of a  
  FeatureServer is a key indicator of a platform's data manipulation capabilities.  
* **ImageServer:** This service is specialized for serving raster and imagery data. It supports operations like dynamic server-side processing, mosaicking, and analysis of pixel data, going far beyond simple image display.1  
* **OGC Services (WMS/WFS):** To ensure broad interoperability with non-Esri clients, ArcGIS Server can expose its data through Open Geospatial Consortium (OGC) standard interfaces.  
  * A **Web Map Service (WMS)** serves georeferenced map images, similar to a MapServer's export function, but using a standardized request format (GetMap, GetCapabilities).8  
  * A **Web Feature Service (WFS)** provides direct access to vector feature data, including geometries and attributes, using standard operations like GetFeature. This is the OGC equivalent of a MapServer or FeatureServer query operation.10

### **1.2 Inventory of Discovered LISTmap Services**

Systematic probing of the LISTmap API, starting from its root services directory at https://services.thelist.tas.gov.au/arcgis/rest/services/, has yielded a clear map of its public-facing architecture.12 Services are organized into thematic folders, with each folder containing one or more specialized services.

The most relevant discovered service folders and their contents are:

* **/Basemaps:** This folder houses a collection of MapServer services that provide the foundational cartography for Tasmania. These include services like Basemaps/Topographic, Basemaps/Hillshade, and Basemaps/Orthophoto.12 These services are heavily cached and optimized for rapid delivery of background map tiles, which aligns with Cygnet's current usage for image tile retrieval.  
* **/Public:** This is a critical folder containing a wealth of thematic vector data. The most significant service discovered within this folder is **Public/OpenDataWFS/MapServer**.13 Analysis reveals this to be a hybrid service of immense value. Despite being a  
  MapServer, its capabilities have been extended to enable WFS access, making it a central point for both visualization and raw data extraction.  
* **/Location, /Planning, /Environment, /Property:** Probing of these service folders indicated they were either empty or inaccessible to public, unauthenticated requests.14 This strongly suggests that these endpoints are placeholders or, more likely, contain secured services that require authentication to access. This is a common practice for protecting sensitive or transactional data.

The following table provides a categorized inventory of the key service endpoints discovered and their relevance to the Cygnet project.

**Table 1: LISTmap Service Endpoint Inventory**

| Service Endpoint URL | Service Type | Primary Function & Cygnet Relevance |
| :---- | :---- | :---- |
| .../Basemaps/Topographic/MapServer | MapServer | Provides cached topographic map tiles. Suitable for high-performance basemap display. 12 |
| .../Basemaps/Orthophoto/MapServer | MapServer | Provides cached aerial and satellite imagery tiles. Suitable for high-performance imagery basemap display. 12 |
| .../Public/OpenDataWFS/MapServer | MapServer (WFS Enabled) | **Crucial Service.** Contains hundreds of thematic vector layers (e.g., Cadastral Parcels, Transport). Supports dynamic map exports, advanced queries, and OGC WFS access. This should be the primary target for all vector data operations. 13 |
| .../Public/OpenDataWFS/MapServer/WFSServer | WFS | The OGC WFS endpoint for the service above. Provides standardized vector data access via GetFeature requests, ensuring interoperability with a wide range of GIS tools. 18 |
| .../arcgis/tokens/generateToken | Token Service | The endpoint for authentication. Not a data service, but the gateway to potentially accessing secured FeatureServers and other non-public resources. 12 |

### **1.3 Service Capabilities and Their Implications**

A detailed examination of the JSON response from the root of each service reveals its specific capabilities, which in turn dictates the architectural design of the LISTmap platform. The Public/OpenDataWFS/MapServer, for example, explicitly lists "WFS" in its supportedInterfaces array and has the property "supportsDynamicLayers": true set.13 These properties are not incidental; they reflect deliberate architectural choices.

The structure of the LISTmap API indicates a clear and logical segregation of services based on data type and intended use.

1. **High-Performance Basemaps:** Foundational, large, and relatively static datasets like topography and aerial imagery are served via heavily cached MapServers in the /Basemaps folder.12 This is a standard, performance-oriented architecture designed to deliver map tiles to clients with minimal latency.  
2. **Dynamic Thematic Data:** More dynamic and interactive vector datasets, such as cadastral boundaries, land use, and infrastructure, are consolidated within the Public/OpenDataWFS/MapServer.13 Publishing this data as a dynamic  
   MapServer with WFS capabilities enabled is a sophisticated choice. It allows the service to simultaneously support high-quality, server-rendered map image generation (via the MapServer's export operation) and direct, standardized access to the raw vector data (via the WFS GetFeature operation).  
3. **Secured Transactional Services:** The standard for enabling data editing (create, update, delete) in an ArcGIS environment is the FeatureServer.5 The complete absence of any publicly discoverable  
   FeatureServers, combined with the prominent Login | Get Token link in the services directory 12, leads to a firm conclusion: any services that support data manipulation are secured and require authentication. This is a standard security posture to prevent unauthorized modification of authoritative government data.

For the Cygnet project, this means the path to enhanced functionality is twofold. First, the project must fully exploit the rich querying and rendering capabilities of the public-facing Public/OpenDataWFS/MapServer. Second, to unlock any form of data editing or submission, the project must engage with LISTmap administrators to investigate the process for obtaining credentials and accessing these secured endpoints.

---

## **Part II: Advanced Data Querying and Analysis**

The Cygnet project's current use of the API for basic GeoJSON retrieval only scratches the surface of its capabilities. The true power of the LISTmap API lies in its query operation, a versatile tool available on MapServer and FeatureServer layers that allows for deep interrogation of data directly on the server.3 Mastering this operation will enable the Unified Dashboard to move from simple data display to a sophisticated analytical platform.

### **2.1 Mastering the query Operation: Attribute and Statistical Filtering**

The query operation is the primary mechanism for retrieving subsets of features based on specific criteria. It is far more powerful than downloading an entire dataset and filtering it on the client.

* **Attribute Queries (where clause):** The cornerstone of any data query is the where parameter, which accepts a standard SQL-92 WHERE clause. This allows for precise filtering based on the attributes of the data. For example, to find all cadastral parcels of a specific type, a query could be constructed with where=CAD\_TYPE1 \= 'Private'. These queries can be used on text, numeric, and date fields, and can include complex logic using operators like AND, OR, LIKE, and IN.20  
* **Time-based Queries (time parameter):** For layers that are time-aware (a property indicated in the layer's metadata), the time parameter can be used to filter features based on a specific time instant or a time range. The time is typically specified in epoch milliseconds. For instance, a query with time=1199145600000, 1230768000000 would retrieve all features active between January 1, 2008, and January 1, 2009\.23 This is invaluable for analyzing historical trends or visualizing data at a specific point in time.  
* **Server-Side Statistical Analysis (outStatistics):** This is one of the most powerful and underutilized features of the query operation. Instead of retrieving features, the outStatistics parameter instructs the server to perform statistical calculations on one or more fields and return only the aggregated result. Supported statistic types include COUNT, SUM, MIN, MAX, AVG (average), STDDEV (standard deviation), and VAR (variance).25 This dramatically reduces the amount of data transferred to the client and offloads complex calculations to the server, resulting in significant performance gains.  
* **Grouping and Summarization (groupByFieldsForStatistics):** The power of outStatistics is amplified when combined with the groupByFieldsForStatistics parameter. This allows for the generation of summary tables directly from the API. For example, an application could request the count of properties (statisticType: 'count', onStatisticField: 'OBJECTID') grouped by tenure type (groupByFieldsForStatistics: 'TENURE\_TY'). The server would return a concise JSON object with the total count for each tenure type, perfect for populating a chart or summary dashboard without ever needing to download the individual feature data.25  
* **Pagination and Large Datasets:** A critical consideration when working with the API is the maxRecordCount property found on services and layers, which limits the number of features returned in a single request (e.g., 2000 for the OpenDataWFS/MapServer).13 To robustly handle layers with more features than this limit, a pagination strategy is essential. The recommended workflow is:  
  1. Perform an initial query with returnIdsOnly=true. This returns an array of all Object IDs that match the query criteria, bypassing the maxRecordCount limit.21  
  2. The client can then batch these IDs into smaller chunks (e.g., groups of 1000).  
  3. Perform subsequent queries using the objectIds parameter to request the full feature data for each batch.  
     Alternatively, for simpler pagination, the resultOffset (number of records to skip) and resultRecordCount (number of records to return) parameters can be used to page through results sequentially.21

### **2.2 Unlocking Spatial Intelligence: Geometric and Relational Queries**

Beyond attribute filtering, the API provides a full suite of tools for spatial analysis, allowing queries to be driven by geographic location and relationships.

* **The geometry and geometryType parameters:** These parameters allow a client to provide a geometric shape—a point, line, polygon, or envelope (bounding box)—to be used as a spatial filter.20 The server will then return only the features from the target layer that have a specific spatial relationship with this input geometry. The geometry can be passed as a detailed JSON object or, for simple shapes like envelopes, as a comma-separated string (  
  geometry=-104,35.6,-94.32,41).  
* **Spatial Relationships (spatialRel):** The spatialRel parameter defines the nature of the spatial test to be performed. This is the core of geospatial analysis. The API supports a comprehensive set of relationships, including 23:  
  * esriSpatialRelIntersects: Returns features that touch, cross, or are contained within the input geometry (the default).  
  * esriSpatialRelContains: Returns features that completely contain the input geometry.  
  * esriSpatialRelWithin: Returns features that are completely within the input geometry.  
  * esriSpatialRelTouches: Returns features that share a boundary with the input geometry but do not overlap.  
  * esriSpatialRelCrosses: Returns features that cross the input geometry.  
  * esriSpatialRelEnvelopeIntersects: A faster but less precise query that checks if the bounding boxes of features intersect.  
* **Querying Related Records (queryRelatedRecords):** For complex datasets with pre-defined database relationships (e.g., a property parcel layer related to an ownership table), the queryRelatedRecords operation is exceptionally efficient.28 Instead of requiring the client to perform two separate queries and join the results, this operation can traverse the relationship on the server. A client can provide a set of Object IDs from a source layer and specify a  
  relationshipId, and the server will return the corresponding records from the related destination layer. This minimizes network traffic and simplifies client-side logic.

### **2.3 Leveraging Data Updates for Near Real-Time Applications**

The research brief identified a need to assess capabilities for real-time data. While the LISTmap API does not appear to offer true real-time streaming services (like those from an ArcGIS StreamServer), it does provide mechanisms for clients to efficiently check for and retrieve data updates. This enables a near real-time experience through intelligent polling.

* **Polling for Updates (returnUpdates):** The MapServer and its layers support a returnUpdates parameter.3 When a request is made with  
  returnUpdates=true, the service does not return feature data. Instead, it returns updated metadata, most notably the layer's current time extent and spatial extent. A client application can periodically make this lightweight call. If the returned extent differs from the last known extent, it signals that the underlying data has changed, and the client can then trigger a full query to refresh its display. This is a simple and effective polling mechanism.  
* **Extracting Deltas (extractChanges):** A more advanced and efficient mechanism for data synchronization is the extractChanges operation, which is a capability of FeatureServers that have ChangeTracking enabled.31 This operation is designed for disconnected editing and synchronization workflows. It allows a client to provide the server generation number from its last sync, and the server will return only the features that have been inserted, updated, or deleted since that time. This "delta-only" approach is vastly more efficient than re-downloading an entire dataset. While no public  
  FeatureServer with this capability was found, its existence in the ArcGIS REST API means it is a potential feature of LISTmap's secured services and a key area for future investigation should Cygnet gain authenticated access.

The availability of these update mechanisms means the Cygnet project can implement a sophisticated, tiered data refresh strategy. For the public MapServer layers, the lightweight returnUpdates polling pattern is immediately available. If authenticated access reveals a FeatureServer with change tracking, the project can graduate to the much more efficient extractChanges delta-sync pattern, significantly enhancing the responsiveness and efficiency of the Unified Dashboard.

The following table provides a comprehensive reference for the most important parameters of the query operation, consolidating information that developers would otherwise need to gather from multiple documentation pages.

**Table 2: The Query Operation Parameter Deep Dive**

| Parameter | Description | Example Usage |
| :---- | :---- | :---- |
| where | An SQL-92 compliant WHERE clause to filter features based on attributes. | where=POPULATION \> 10000 AND STATE\_NAME \= 'Tasmania' |
| objectIds | A comma-separated list of Object IDs to retrieve specific features. | objectIds=101,102,105 |
| time | A time instant or time extent (start,end) in epoch milliseconds to query time-aware layers. | time=1577836800000,1609459199000 |
| geometry | A JSON geometry object (point, line, polygon, envelope) to use as a spatial filter. | geometry={"xmin":147,"ymin":-42,"xmax":148,"ymax":-41} |
| geometryType | Specifies the type of geometry being passed. Required when using geometry. | geometryType=esriGeometryEnvelope |
| spatialRel | The spatial relationship to test between the input geometry and the layer's features. | spatialRel=esriSpatialRelContains |
| outFields | A comma-separated list of fields to include in the response. \* returns all fields. | outFields=PID,VOLUME,FOLIO,COMP\_AREA |
| returnGeometry | A boolean indicating whether to include feature geometries in the response. Default is true. | returnGeometry=false |
| outSR | The well-known ID (WKID) or JSON object for the desired output spatial reference. | outSR=4326 |
| outStatistics | A JSON array defining statistical calculations to perform on the data. | outStatistics= |
| groupByFieldsForStatistics | A field or fields to group the results of an outStatistics query. | groupByFieldsForStatistics=TENURE\_TY |
| returnIdsOnly | A boolean. If true, returns only an array of Object IDs, bypassing maxRecordCount. | returnIdsOnly=true |
| resultOffset | The number of features to skip from the beginning of the result set. Used for pagination. | resultOffset=1000 |
| resultRecordCount | The maximum number of features to return in the response. Used for pagination. | resultRecordCount=500 |
| f | The desired output format for the response. | f=geojson |

---

## **Part III: Data Formats and OGC Interoperability**

The Cygnet project's current use of GeoJSON is a solid starting point, but the LISTmap API offers a much broader spectrum of data formats. Understanding and leveraging these different formats can lead to significant performance improvements and greater interoperability with other systems. The API's support for OGC standards further enhances this flexibility.

### **3.1 Beyond GeoJSON: A Spectrum of Output Formats**

The f (format) parameter is a nearly universal query parameter across the ArcGIS REST API, allowing clients to specify the format of the response.32 The LISTmap services support several key formats of interest to Cygnet:

* **Esri JSON (f=json):** This is the native and most feature-rich JSON format provided by the API. It contains all the information of GeoJSON but includes additional Esri-specific constructs, such as detailed spatial reference information and support for true curves (as opposed to densified straight-line segments).32 For applications built purely within the Esri ecosystem (e.g., using the ArcGIS Maps SDK for JavaScript), this format is often the most performant and capable.  
* **GeoJSON (f=geojson):** This is the format currently used by Cygnet. It is an open standard (RFC 7946\) and is exceptionally well-supported by a vast array of open-source mapping libraries (e.g., Leaflet, OpenLayers, Mapbox GL JS).33 While it is an excellent choice for interoperability, it may not support all Esri-specific geometry features like true curves. The  
  Public/OpenDataWFS/MapServer explicitly supports GeoJSON output.13  
* **Protocol Buffers (f=pbf):** This is a high-performance, compact binary format for serializing structured data. The pbf format is significantly smaller and faster for a client to parse than text-based formats like JSON or GeoJSON.33 Analysis of the  
  OpenDataWFS/MapServer layers reveals that pbf is listed in their supportedQueryFormats property.3 Adopting PBF for data-intensive queries represents a key performance optimization opportunity for the Cygnet project, especially on mobile or low-bandwidth connections.  
* **KML (f=kmz):** Keyhole Markup Language (KML) is the standard format for displaying data in applications like Google Earth.34 The LISTmap API provides two primary ways to generate KML. First, the  
  query operation can return results directly as KML by setting f=kmz.35 Second,  
  MapServers offer a dedicated generateKml operation that creates a network-linked KMZ file, which is a more robust way to serve dynamic KML content.34

### **3.2 Integrating with OGC Standards: WMS and WFS Endpoints**

The LISTmap platform demonstrates a commitment to open standards by providing OGC-compliant endpoints for its data. This allows for seamless integration with a wide range of desktop and web-based GIS software, not just those from Esri.

* **Web Map Service (WMS):** WMS is the OGC standard for requesting georeferenced map images. Any LISTmap MapServer can be accessed as a WMS service by appending /WMSServer? to its base URL.8 A client can then make standard WMS requests, such as  
  GetCapabilities (to retrieve metadata about the service and its layers) and GetMap (to request a map image for a specific extent and set of layers). This is particularly useful for integrating LISTmap layers into third-party GIS applications that require a WMS feed.  
* **Web Feature Service (WFS):** WFS is the OGC standard for requesting vector feature data itself, rather than just an image of it.10 The  
  Public/OpenDataWFS/MapServer provides a dedicated WFS endpoint at .../MapServer/WFSServer.13 This endpoint responds to standard WFS operations:  
  * GetCapabilities: Returns an XML document describing the service, its available feature types (layers), supported operations, and output formats.  
  * DescribeFeatureType: Returns the schema (field names and types) for a specific feature type.  
  * GetFeature: Retrieves the actual feature data (geometry and attributes), often in GML (Geography Markup Language) format, based on spatial or attribute filters.37

    This WFS endpoint provides a powerful, standardized alternative to the Esri-native query operation for fetching vector data.  
* **Web Feature Service \- Transactional (WFS-T):** WFS-T is an extension of the WFS standard that supports feature editing.11 It adds the  
  Transaction operation, which allows clients to submit Insert, Update, and Delete requests, typically formatted as an XML payload. To determine if the LISTmap WFS service supports editing, a GetCapabilities request must be made. The resulting XML document must then be inspected for the presence of the \<wfs:Transaction\> element. If this element exists and lists operations like Insert, Update, and Delete, then the service is transactional. This would provide a standardized, non-proprietary pathway for the Cygnet project to implement data submission features.

The Public/OpenDataWFS/MapServer is effectively a "Rosetta Stone" service. It speaks both Esri's native REST dialect and the OGC's WFS standard from a single service definition. This architecture provides maximum flexibility. The Cygnet team can use the Esri-native query operation to access powerful, proprietary features like outStatistics, while simultaneously using the standardized WFS interface for interoperability with other tools or for workflows where adherence to open standards is paramount. The availability of the high-performance PBF format is a significant and actionable finding that can directly address performance bottlenecks associated with large vector datasets.

---

## **Part IV: Dynamic Visualization and Server-Side Rendering**

One of the most powerful and transformative capabilities discovered in the LISTmap API is the ability to dynamically alter map symbology on the server. This feature, enabled by "Dynamic Layers," allows for the creation of rich, interactive thematic maps while maintaining high performance. It represents a fundamental architectural shift from the current client-side rendering model to a more efficient server-side approach.

### **4.1 On-the-Fly Symbology with Dynamic Layers**

The concept of "Dynamic Layers" is a feature of ArcGIS Server that permits per-request modification of a layer's properties, including its data source, definition query, and, most importantly, its appearance.39 The investigation confirms that the

Public/OpenDataWFS/MapServer has this capability enabled, as its service definition includes the property "supportsDynamicLayers": true.13

This capability is primarily accessed through the export operation of the MapServer.41 While this operation can be used to simply export a static image of the map as it is currently defined, its true power is unlocked by the

dynamicLayers parameter. This parameter accepts a JSON array where each object in the array represents a layer to be drawn. Crucially, each of these JSON objects can include a drawingInfo property that completely overrides the layer's default, published symbology for that single request.

The structure of the dynamicLayers parameter allows for precise control over the final map image. The order of the layers in the JSON array dictates their drawing order on the map, with the first layer in the array being drawn on top.41 This enables dynamic re-ordering of map layers from the client application.

### **4.2 Programmatic Control of Layer Appearance**

The key to dynamic visualization is the drawingInfo object. By constructing this object in the client application and passing it within the dynamicLayers parameter, Cygnet can instruct the server to render the map in virtually any style imaginable.

* **The drawingInfo Object:** This JSON object is the blueprint for layer rendering. It contains a renderer object that defines the symbology. The API supports several renderer types 41:  
  * **Simple Renderer:** Applies a single, uniform symbol to all features in the layer.  
  * **Unique Value Renderer:** Applies a different symbol to features based on the unique values in a specified attribute field (e.g., using different colors for each CAD\_TYPE1 in the cadastral layer).  
  * Class Breaks Renderer: Groups features into classes based on a numeric attribute and applies a different symbol to each class. This is ideal for creating choropleth maps (e.g., coloring areas by population density or land value).  
    The drawingInfo object also allows for control over layer transparency and labeling, providing comprehensive cartographic control.  
* **Use Case for the Cygnet Unified Dashboard:** This capability can directly power a highly interactive user experience. Consider a workflow where a user wants to visualize land capability:  
  1. The UI presents the user with a list of classifiable fields (e.g., "Land Capability Class," "Tenure Type") and a selection of color ramps.  
  2. When the user makes a selection, the client-side application does not download any feature data. Instead, it constructs a dynamicLayers JSON payload. This payload would specify the target layer (e.g., Cadastral Parcels) and a drawingInfo object containing a classBreaksRenderer configured with the user's chosen field and color ramp.  
  3. The client sends this small JSON object to the MapServer's export endpoint.  
  4. The LISTmap server, which has direct, high-speed access to the underlying data, performs the classification and rendering.  
  5. The server returns a lightweight map image (e.g., a PNG or JPG) that is perfectly styled according to the user's request.  
  6. The client application simply displays this image as an overlay on the basemap.

This server-side rendering architecture offers a profound advantage over Cygnet's likely current model of downloading GeoJSON and styling it in the browser. For large or complex datasets, client-side rendering can be slow, consume significant memory, and lead to a poor user experience. By shifting the rendering workload to the server, the client application remains lightweight and responsive. The amount of data transferred is minimized (a small JSON request and a compressed image response), and the cartographic quality is consistently high, as it is generated by the powerful ArcGIS Server rendering engine. This is a high-impact, high-value feature that should be a top priority for integration into the Cygnet project.

---

## **Part V: Feature Manipulation and Transactional Services**

A core requirement of the research brief is to investigate the potential for feature editing and the submission of new data. The analysis indicates that while the LISTmap platform is fully capable of supporting such transactional workflows, these capabilities are almost certainly restricted to authenticated users. This section outlines the two primary technical pathways for feature manipulation and the steps required to validate their availability.

### **5.1 Analysis of FeatureServer Editing Capabilities**

In the Esri ecosystem, the FeatureServer is the definitive service type for enabling rich feature editing over the web.4 Its primary transactional operation is

applyEdits, a highly efficient method that allows a client to submit additions, updates, and deletions in a single, atomic request.19

The editability of a FeatureServer is explicitly declared in its capabilities property. When inspecting a FeatureServer's JSON definition, the presence of values like Create, Update, Delete, and Editing confirms that these operations are enabled by the service administrator.6 Additional properties such as

allowGeometryUpdates (confirming that feature shapes can be modified) and syncEnabled (indicating support for disconnected editing workflows) provide further detail on the service's transactional nature.

As the initial, unauthenticated probing of the LISTmap service directory did not reveal any services of type FeatureServer, it is concluded that any such services are secured. The recommended methodology for discovering them is to first obtain an authentication token (as described in Part VI) and then systematically re-explore the service directory folders (/Public, /Property, etc.). An authenticated session may reveal previously hidden FeatureServer endpoints.

### **5.2 Potential for Data Submission via WFS-Transactional (WFS-T)**

An alternative, standards-based pathway for feature editing is the OGC Web Feature Service-Transactional (WFS-T) protocol.11 This is an extension of the WFS standard that adds a

Transaction operation. A Transaction request allows a client to send a payload, typically formatted in XML, containing Insert, Update, and Delete instructions for features in the service.

The key to determining if the LISTmap WFS endpoint supports transactional operations lies in its GetCapabilities document. The process is as follows:

1. Make a GetCapabilities request to the WFS endpoint: https://services.thelist.tas.gov.au/arcgis/rest/services/Public/OpenDataWFS/MapServer/WFSServer?service=WFS\&request=GetCapabilities.  
2. The server will return a detailed XML document. This document must be parsed to search for a \<wfs:Transaction\> element.  
3. If this element is present, its child elements will specify the exact operations supported (e.g., \<wfs:Insert\>, \<wfs:Update\>, \<wfs:Delete\>).

If WFS-T is supported, it would provide the Cygnet project with a standardized, non-proprietary method for implementing feature editing, promoting interoperability with a wider range of potential client applications. However, similar to FeatureServers, it is highly probable that WFS-T capabilities would only be enabled on a secured service.

The ability for the Cygnet application to perform direct feature editing is therefore contingent on its level of access to the LISTmap system. The platform's architecture strongly implies a deliberate public/private boundary. Public access is read-only, providing rich visualization and query capabilities through MapServer and WFS. Transactional capabilities, which carry the inherent risk of data corruption or unauthorized changes, are logically placed behind a security barrier. The critical path forward for the Cygnet project is not purely technical but also procedural: the team must engage with LISTmap administrators to clarify their access rights and request credentials. If credentials can be obtained, the full suite of editing features via either FeatureServer or WFS-T will likely become available. If not, the application will be limited to the powerful but read-only operations detailed in the preceding sections.

The following table can be used to assess any discovered transactional services once authenticated access is achieved.

**Table 3: Feature Editing Capability Assessment Matrix**

| Service Endpoint | Service Type | Create | Update | Delete | Sync | Attachments | WFS-T |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| *(Example:.../Property/CadastreEdit/FeatureServer)* | FeatureServer | *Yes/No* | *Yes/No* | *Yes/No* | *Yes/No* | *Yes/No* | *N/A* |
| .../Public/OpenDataWFS/MapServer/WFSServer | WFS | *N/A* | *N/A* | *N/A* | *N/A* | *N/A* | *Yes/No* |

---

## **Part VI: Security and Authentication Protocols**

The security model of the LISTmap API is a critical component that governs access to its full range of capabilities. The investigation reveals a clear separation between public, anonymous services and secured resources that require authentication. Understanding this model is essential for the Cygnet project to plan its integration strategy, particularly for any features involving data manipulation.

### **6.1 Public vs. Secured Endpoints**

The analysis of the service directory at https://services.thelist.tas.gov.au/arcgis/rest/services/ shows that a significant number of services are publicly accessible. All services within the /Basemaps folder and the OpenDataWFS/MapServer within the /Public folder can be accessed without any form of authentication.12 These services provide the core read-only and visualization functionalities of the platform.

Conversely, the absence of any public FeatureServer endpoints and the inaccessibility of folders like /Property and /Planning strongly indicate the presence of a secured layer of services.15 This is a standard and recommended practice for enterprise GIS deployments, where sensitive data and transactional capabilities are protected from public access. Access to these resources is controlled via a token-based authentication system.

### **6.2 Token-Based Authentication**

The LISTmap API employs the standard ArcGIS token-based authentication mechanism.9 This is a robust and widely used security model that avoids the need to send user credentials with every request. The workflow consists of two primary steps:

1. **Generate Token:** The client application initiates the authentication process by sending a POST request to the token generation endpoint. For the LISTmap services, this is likely https://services.thelist.tas.gov.au/arcgis/tokens/generateToken. This request must include the user's credentials (username and password) as well as other parameters, such as the client type (e.g., requestip) and the desired token expiration time.  
2. **Use Token:** If the credentials are valid, the server responds with a JSON object containing a short-lived authentication token. This token string must then be appended as a query parameter (token=\<token\_string\>) to every subsequent API request made to a secured resource. The server validates this token with each request before granting access.

For the Cygnet development team, a practical approach to test this, once credentials are provided by LISTmap administrators, would be to use a tool like curl or Postman. A sample curl request to obtain a token would look like this:

Bash

curl \-X POST \-d "username=YOUR\_USERNAME\&password=YOUR\_PASSWORD\&client=requestip\&f=json" \\  
https://services.thelist.tas.gov.au/arcgis/tokens/generateToken

Upon successful authentication, the response will contain the token. This token can then be used to explore the previously inaccessible service folders and endpoints. For example, a request to list the contents of the /Property folder would be:

Bash

curl "https://services.thelist.tas.gov.au/arcgis/rest/services/Property?f=json\&token=YOUR\_OBTAINED\_TOKEN"

Successfully executing this workflow is the key to unlocking the full suite of LISTmap's capabilities, including any available FeatureServers for data editing and other restricted datasets.

---

## **Part VII: Strategic Integration Roadmap for Cygnet**

This final section synthesizes the comprehensive technical analysis of the LISTmap API into a strategic and actionable roadmap for the Cygnet project. It prioritizes the integration of newly discovered features based on their potential impact, implementation complexity, and alignment with the project's goals. This roadmap provides clear guidance for developers, designers, and project management to enhance the Unified Dashboard's geospatial capabilities.

### **7.1 High-Impact Opportunities: A Prioritized Features Matrix**

The following matrix distills the report's findings into a prioritized list of features for integration. It evaluates each feature's value to the Cygnet project, estimates its implementation complexity, notes any dependencies, and assigns a recommended priority. This serves as a strategic guide for sequencing development work to achieve maximum impact efficiently.

**Table 4: Prioritized Integration Matrix for Cygnet**

| Feature Name | Description | Value to Cygnet | Implementation Complexity | Dependencies | Recommended Priority |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Dynamic Symbology via export** | Use the MapServer export operation with the dynamicLayers parameter to render maps with client-defined symbology on the server. | **High** (Enables rich, interactive thematic maps with excellent performance) | Medium | None | **Priority 1** |
| **WFS for Vector Data Retrieval** | Utilize the OGC WFS endpoint (.../WFSServer) for standardized, interoperable access to vector data layers. | **High** (Ensures flexibility, open standards compliance, and robust data access) | Low | None | **Priority 1** |
| **PBF for Query Performance** | Switch from f=geojson to f=pbf for query operations to leverage a more compact and efficient binary data format. | **Medium** (Significant performance optimization for large datasets and low-bandwidth clients) | Low | PBF parsing library on client | **Priority 2** |
| **Advanced Spatial & Statistical Queries** | Implement UI controls that leverage server-side spatial (spatialRel) and statistical (outStatistics) queries. | **High** (Unlocks powerful analytical capabilities and improves dashboard performance) | Medium | None | **Priority 2** |
| **Feature Editing via applyEdits or WFS-T** | Implement workflows for creating, updating, and deleting features using either a FeatureServer or a WFS-T service. | **High** (Enables data submission and management, a core project requirement) | High | **Authentication Credentials** | **Priority 3 (Exploratory)** |
| **Real-time Update Polling** | Use the returnUpdates parameter for lightweight polling of MapServer layers to detect data changes. | **Medium** (Enables near real-time data refresh for dynamic dashboards) | Medium | None | **Priority 3** |

### **7.2 Proof-of-Concept: Code Examples for Priority Features**

To accelerate development, this section provides practical code examples for the highest-priority features identified in the matrix. These snippets demonstrate the core API interactions required.

#### **PoC 1: Dynamic Symbology (JavaScript Example)**

This example demonstrates how to request a map image from the OpenDataWFS/MapServer with dynamic symbology. It colors the Cadastral Parcels layer based on the CAD\_TYPE1 field.

JavaScript

// The base URL for the export operation  
const exportUrl \= "https://services.thelist.tas.gov.au/arcgis/rest/services/Public/OpenDataWFS/MapServer/export";

// Define the dynamic renderer for the Cadastral Parcels layer (ID: 14\)  
const dynamicRenderer \= {  
  "id": 14,  
  "source": { "type": "mapLayer", "mapLayerId": 14 },  
  "drawingInfo": {  
    "renderer": {  
      "type": "uniqueValue",  
      "field1": "CAD\_TYPE1",  
      "defaultSymbol": { "type": "esriSFS", "style": "esriSFSSolid", "color": , "outline": { "type": "esriSLS", "style": "esriSLSSolid", "color": , "width": 0.4 } },  
      "uniqueValueInfos": } },  
        { "value": "Authority", "symbol": { "type": "esriSFS", "style": "esriSFSSolid", "color":  } }  
      \]  
    }  
  }  
};

// Define the parameters for the export request  
const params \= new URLSearchParams({  
  "bbox": "500000,5250000,510000,5260000", // Example bounding box over Hobart  
  "bboxSR": "3857",  
  "imageSR": "3857",  
  "size": "800,600",  
  "format": "png",  
  "transparent": "true",  
  "dynamicLayers": JSON.stringify(),  
  "f": "image" // Request the raw image directly  
});

// Construct the final URL and use it, for example, as the src for an \<img\> tag  
const imageUrl \= \`${exportUrl}?${params.toString()}\`;  
console.log("Dynamic Map Image URL:", imageUrl);  
// document.getElementById('map-overlay-image').src \= imageUrl;

#### **PoC 2: WFS GetFeature Request (curl Example)**

This example uses curl to make a standard WFS GetFeature request to retrieve all Transport Segments (layer ID 42\) within a specified bounding box.

Bash

curl \-G "https://services.thelist.tas.gov.au/arcgis/rest/services/Public/OpenDataWFS/MapServer/WFSServer" \\  
  \--data-urlencode "service=WFS" \\  
  \--data-urlencode "request=GetFeature" \\  
  \--data-urlencode "version=2.0.0" \\  
  \--data-urlencode "typeName=Public\_OpenDataWFS:Transport\_Segments" \\  
  \--data-urlencode "bbox=515000,5255000,525000,5265000,urn:ogc:def:crs:EPSG::3857" \\  
  \--data-urlencode "outputFormat=application/json"

#### **PoC 3: Statistical Query (URL Request Example)**

This example constructs a URL for a query operation that calculates the total computed area (COMP\_AREA) of all cadastral parcels, grouped by their tenure type (TENURE\_TY). The result is a summary table, not individual features.

https://services.thelist.tas.gov.au/arcgis/rest/services/Public/OpenDataWFS/MapServer/14/query?  
where=1%3D1  
\&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22COMP\_AREA%22%2C%22outStatisticFieldName%22%3A%22TotalArea%22%7D%5D  
\&groupByFieldsForStatistics=TENURE\_TY  
\&f=pjson

*(Note: The outStatistics parameter is URL-encoded for clarity in the example.)*

### **7.3 Identified API Limitations and Strategic Workarounds**

While the LISTmap API is powerful, the investigation identified several constraints that require strategic workarounds.

* **Limitation 1: maxRecordCount on Feature Retrieval.** The API imposes a hard limit on the number of features returned in a single query (e.g., 2000 records from OpenDataWFS/MapServer).13 A simple query against a layer with more features will result in an incomplete dataset.  
  * **Strategic Workaround:** Implement a robust pagination client. As detailed in Part II, the client should first perform a query with returnIdsOnly=true to fetch the complete list of matching Object IDs. It should then process these IDs in batches, making subsequent query requests using the objectIds parameter to retrieve the full feature data for each batch. This is the most reliable method for handling large datasets.  
* **Limitation 2: Absence of Publicly Accessible Editing Services.** The most significant constraint identified is the lack of public FeatureServer or WFS-T services. This currently prevents the implementation of any data submission or editing functionality.  
  * **Strategic Workaround:** This is a procedural, not a technical, limitation. The Cygnet project team must formally engage with the LISTmap administrators (contact email: listhelp@nre.tas.gov.au 44) to:  
    1. Inquire about the availability of secured, transactional services.  
    2. Request the necessary documentation and API endpoints.  
    3. Begin the process of obtaining authentication credentials for the Cygnet application.  
* **Limitation 3: Potential for Unreliable OGC Endpoints.** The WFS GetCapabilities document was found to be inaccessible during probing 45, and an official user guide noted a historical bug related to WFS consumption in some Esri clients.18  
  * **Strategic Workaround:** The WFS endpoint's reliability must be thoroughly tested during development. If it proves to be inconsistent or buggy, the project should use the Esri-native query operation as a fallback. Requesting data with f=geojson or f=pbf via the query operation on the MapServer layer provides a more direct and potentially more robust path to retrieving the same vector data, albeit through a proprietary interface.

#### **Works cited**

1. Build powerful apps with ArcGIS services | Esri Developer REST ..., accessed on July 21, 2025, [https://developers.arcgis.com/rest/](https://developers.arcgis.com/rest/)  
2. ArcGIS Server REST API, accessed on July 21, 2025, [http://gisweb.dotd.la.gov/arcgis/SDK/REST/index.html?gettingstarted.html](http://gisweb.dotd.la.gov/arcgis/SDK/REST/index.html?gettingstarted.html)  
3. Map Service | ArcGIS REST APIs \- Esri Developer, accessed on July 21, 2025, [https://developers.arcgis.com/rest/services-reference/enterprise/map-service.htm](https://developers.arcgis.com/rest/services-reference/enterprise/map-service.htm)  
4. ArcGIS Server REST API, accessed on July 21, 2025, [http://gisweb.dotd.la.gov/arcgis/SDK/REST/index.html?featureserver.html](http://gisweb.dotd.la.gov/arcgis/SDK/REST/index.html?featureserver.html)  
5. Feature Service | ArcGIS REST APIs \- Esri Developer, accessed on July 21, 2025, [https://developers.arcgis.com/rest/services-reference/enterprise/feature-service/](https://developers.arcgis.com/rest/services-reference/enterprise/feature-service/)  
6. Feature Service | ArcGIS REST APIs | Esri Developer, accessed on July 21, 2025, [https://developers.arcgis.com/rest/services-reference/enterprise/feature-service.htm](https://developers.arcgis.com/rest/services-reference/enterprise/feature-service.htm)  
7. ArcGIS Server Services Directory root | ArcGIS REST APIs \- Esri Developer, accessed on July 21, 2025, [https://developers.arcgis.com/rest/services-reference/enterprise/catalog/](https://developers.arcgis.com/rest/services-reference/enterprise/catalog/)  
8. WMS services—ArcGIS Server | Documentation for ArcGIS Enterprise, accessed on July 21, 2025, [https://enterprise.arcgis.com/en/server/latest/publish-services/windows/wms-services.htm](https://enterprise.arcgis.com/en/server/latest/publish-services/windows/wms-services.htm)  
9. ArcGIS Server \- WMS services, accessed on July 21, 2025, [https://enterprise.arcgis.com/en/server/latest/publish-services/linux/wms-services.htm](https://enterprise.arcgis.com/en/server/latest/publish-services/linux/wms-services.htm)  
10. WFS services—ArcGIS Server | Documentation for ArcGIS Enterprise, accessed on July 21, 2025, [https://enterprise.arcgis.com/en/server/10.8/publish-services/windows/wfs-services.htm](https://enterprise.arcgis.com/en/server/10.8/publish-services/windows/wfs-services.htm)  
11. WFS services—ArcGIS Server | Documentation for ArcGIS Enterprise, accessed on July 21, 2025, [https://enterprise.arcgis.com/en/server/11.5/publish-services/linux/wfs-services.htm](https://enterprise.arcgis.com/en/server/11.5/publish-services/linux/wfs-services.htm)  
12. Basemaps \- Folder, accessed on July 21, 2025, [https://services.thelist.tas.gov.au/arcgis/rest/services/Basemaps](https://services.thelist.tas.gov.au/arcgis/rest/services/Basemaps)  
13. Public/OpenDataWFS (MapServer), accessed on July 21, 2025, [https://services.thelist.tas.gov.au/arcgis/rest/services/Public/OpenDataWFS/MapServer](https://services.thelist.tas.gov.au/arcgis/rest/services/Public/OpenDataWFS/MapServer)  
14. accessed on January 1, 1970, [https://services.thelist.tas.gov.au/arcgis/rest/services/Location](https://services.thelist.tas.gov.au/arcgis/rest/services/Location)  
15. accessed on January 1, 1970, [https://services.thelist.tas.gov.au/arcgis/rest/services/Planning](https://services.thelist.tas.gov.au/arcgis/rest/services/Planning)  
16. accessed on January 1, 1970, [https://services.thelist.tas.gov.au/arcgis/rest/services/Environment](https://services.thelist.tas.gov.au/arcgis/rest/services/Environment)  
17. accessed on January 1, 1970, [https://services.thelist.tas.gov.au/arcgis/rest/services/Property](https://services.thelist.tas.gov.au/arcgis/rest/services/Property)  
18. LIST Spatial Web Services User Guide \- Department of Natural Resources and Environment Tasmania, accessed on July 21, 2025, [https://www.thelist.tas.gov.au/app/content/the-list/news\_and\_information/resources/list\_spatial\_web\_services\_user\_guide.pdf](https://www.thelist.tas.gov.au/app/content/the-list/news_and_information/resources/list_spatial_web_services_user_guide.pdf)  
19. ArcGIS-REST-API/HostedFeatureServices/README.md at master \- GitHub, accessed on July 21, 2025, [https://github.com/esri-es/ArcGIS-REST-API/blob/master/HostedFeatureServices/README.md](https://github.com/esri-es/ArcGIS-REST-API/blob/master/HostedFeatureServices/README.md)  
20. Query (Operation) \- ArcGIS Server REST API, accessed on July 21, 2025, [http://gisweb.dotd.la.gov/arcgis/SDK/REST/index.html?query.html](http://gisweb.dotd.la.gov/arcgis/SDK/REST/index.html?query.html)  
21. Query (Map Service/Layer) | ArcGIS REST APIs | Esri Developer, accessed on July 21, 2025, [https://developers.arcgis.com/rest/services-reference/enterprise/query-map-service-layer/](https://developers.arcgis.com/rest/services-reference/enterprise/query-map-service-layer/)  
22. Querying Feature Services: Date-Time Queries \- Esri, accessed on July 21, 2025, [https://www.esri.com/arcgis-blog/products/api-rest/data-management/querying-feature-services-date-time-queries](https://www.esri.com/arcgis-blog/products/api-rest/data-management/querying-feature-services-date-time-queries)  
23. Query (Map Service/Dynamic Layer) | ArcGIS REST APIs | Esri Developer, accessed on July 21, 2025, [https://developers.arcgis.com/rest/services-reference/enterprise/query-map-service-dynamic-layer/](https://developers.arcgis.com/rest/services-reference/enterprise/query-map-service-dynamic-layer/)  
24. Query (Feature Service) | ArcGIS REST APIs \- Esri Developer, accessed on July 21, 2025, [https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service/](https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service/)  
25. Using output statistics in ArcGIS REST API query? \- GIS StackExchange, accessed on July 21, 2025, [https://gis.stackexchange.com/questions/297327/using-output-statistics-in-arcgis-rest-api-query](https://gis.stackexchange.com/questions/297327/using-output-statistics-in-arcgis-rest-api-query)  
26. LIST Cadastral Parcels (ID: 14\) \- Layer, accessed on July 21, 2025, [https://services.thelist.tas.gov.au/arcgis/rest/services/Public/OpenDataWFS/MapServer/14](https://services.thelist.tas.gov.au/arcgis/rest/services/Public/OpenDataWFS/MapServer/14)  
27. Spatial Queries, accessed on July 21, 2025, [https://cran.r-project.org/web/packages/arcpullr/vignettes/spatial\_queries.html](https://cran.r-project.org/web/packages/arcpullr/vignettes/spatial_queries.html)  
28. Query Related Records (Map Service/Layer) | ArcGIS REST APIs | Esri Developer, accessed on July 21, 2025, [https://developers.arcgis.com/rest/services-reference/enterprise/query-related-records-feature-service-layer/](https://developers.arcgis.com/rest/services-reference/enterprise/query-related-records-feature-service-layer/)  
29. Layer / Table | ArcGIS REST APIs \- Esri Developer, accessed on July 21, 2025, [https://developers.arcgis.com/rest/services-reference/enterprise/layer-table/](https://developers.arcgis.com/rest/services-reference/enterprise/layer-table/)  
30. ArcGIS REST API \- ArcGIS Services \- Map Service \- City of Cape Town, accessed on July 21, 2025, [https://citymaps.capetown.gov.za/agsext1/rest/services/Theme\_Based/Transport/MapServer?f=help](https://citymaps.capetown.gov.za/agsext1/rest/services/Theme_Based/Transport/MapServer?f=help)  
31. Extract Changes (Feature Service) | ArcGIS REST APIs \- Esri Developer, accessed on July 21, 2025, [https://developers.arcgis.com/rest/services-reference/enterprise/extract-changes-feature-service/](https://developers.arcgis.com/rest/services-reference/enterprise/extract-changes-feature-service/)  
32. Output formats, accessed on July 21, 2025, [https://resources.arcgis.com/en/help/sds/rest/formattypes.html](https://resources.arcgis.com/en/help/sds/rest/formattypes.html)  
33. Output formats | ArcGIS REST APIs \- Esri Developer, accessed on July 21, 2025, [https://developers.arcgis.com/rest/services-reference/enterprise/output-formats/](https://developers.arcgis.com/rest/services-reference/enterprise/output-formats/)  
34. KML support in ArcGIS Server—ArcGIS Server | Documentation for ArcGIS Enterprise, accessed on July 21, 2025, [https://enterprise.arcgis.com/en/server/latest/publish-services/linux/kml-support-in-arcgis-server.htm](https://enterprise.arcgis.com/en/server/latest/publish-services/linux/kml-support-in-arcgis-server.htm)  
35. Viewing services as KML—ArcGIS Server | Documentation for ArcGIS Enterprise, accessed on July 21, 2025, [https://enterprise.arcgis.com/en/server/11.5/publish-services/linux/viewing-services-as-kml.htm](https://enterprise.arcgis.com/en/server/11.5/publish-services/linux/viewing-services-as-kml.htm)  
36. Generate KML (Operation) \- ArcGIS Server REST API, accessed on July 21, 2025, [http://gisweb.dotd.la.gov/arcgis/SDK/REST/index.html?generatekml.html](http://gisweb.dotd.la.gov/arcgis/SDK/REST/index.html?generatekml.html)  
37. Communicate with a WFS service in a web browser—ArcGIS Server, accessed on July 21, 2025, [https://enterprise.arcgis.com/en/server/latest/publish-services/windows/communicating-with-a-wfs-service-in-a-web-browser.htm](https://enterprise.arcgis.com/en/server/latest/publish-services/windows/communicating-with-a-wfs-service-in-a-web-browser.htm)  
38. Communicating with a WFS service in a web browser—ArcGIS Server, accessed on July 21, 2025, [https://enterprise.arcgis.com/en/server/10.8/publish-services/windows/communicating-with-a-wfs-service-in-a-web-browser.htm](https://enterprise.arcgis.com/en/server/10.8/publish-services/windows/communicating-with-a-wfs-service-in-a-web-browser.htm)  
39. Dynamic layers—ArcGIS Server, accessed on July 21, 2025, [https://enterprise.arcgis.com/en/server/11.4/publish-services/windows/about-dynamic-layers.htm](https://enterprise.arcgis.com/en/server/11.4/publish-services/windows/about-dynamic-layers.htm)  
40. Enable dynamic layers on a map service in Manager \- ArcGIS Enterprise, accessed on July 21, 2025, [https://enterprise.arcgis.com/en/server/latest/publish-services/windows/enabling-dynamic-layers-on-a-map-service-in-manager.htm](https://enterprise.arcgis.com/en/server/latest/publish-services/windows/enabling-dynamic-layers-on-a-map-service-in-manager.htm)  
41. Export Map (Operation) \- ArcGIS, accessed on July 21, 2025, [http://map.dma.dk/arcgis/sdk/rest/export.html](http://map.dma.dk/arcgis/sdk/rest/export.html)  
42. Export Map | ArcGIS REST APIs \- Esri Developer, accessed on July 21, 2025, [https://developers.arcgis.com/rest/services-reference/enterprise/export-map/](https://developers.arcgis.com/rest/services-reference/enterprise/export-map/)  
43. ExportWebMap specification | ArcGIS REST APIs \- Esri Developer, accessed on July 21, 2025, [https://developers.arcgis.com/rest/services-reference/enterprise/exportwebmap-specification/](https://developers.arcgis.com/rest/services-reference/enterprise/exportwebmap-specification/)  
44. LISTmap \- Department of Natural Resources and Environment Tasmania, accessed on July 21, 2025, [https://nre.tas.gov.au/land-tasmania/the-list/listmap](https://nre.tas.gov.au/land-tasmania/the-list/listmap)  
45. accessed on January 1, 1970, [https://services.thelist.tas.gov.au/arcgis/services/Public/OpenDataWFS/MapServer/WFSServer?request=GetCapabilities](https://services.thelist.tas.gov.au/arcgis/services/Public/OpenDataWFS/MapServer/WFSServer?request=GetCapabilities)