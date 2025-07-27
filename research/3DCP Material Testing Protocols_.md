

# **Material Testing and Quality Control Manual for 3D Concrete Printing**

## **Part 1: Framework for Quality Assurance in 3D Concrete Printing (3DCP)**

### **1.1. Introduction to the Quality Management System (QMS)**

#### **1.1.1. Purpose**

This manual establishes the definitive, non-negotiable protocols for material testing and quality control for all 3D Concrete Printing (3DCP) construction projects undertaken using the COBOD 2 or COBOD 3 systems. Its primary purpose is to ensure consistent material quality, structural integrity, and long-term durability for every printed element. The procedures outlined herein are designed to generate a complete, traceable, and defensible record of quality that provides critical data for ongoing process improvement and robust evidence for regulatory compliance.1 This document serves as the single source of truth for all quality-related activities, from raw material reception to final hardened concrete verification.

The implementation of this QMS is not merely a procedural formality; it is a fundamental strategy for proactive risk mitigation. The additive manufacturing (AM) process, while offering significant advantages in speed and design freedom, introduces novel and complex failure modes not present in conventional construction.2 Research and forensic analysis of AM components have shown that failures may not manifest as immediate, dramatic collapses. Instead, they can emerge subtly through the accumulation of undetected variations, such as poor interlayer bonding, microstructural unpredictability, or gradual material degradation.4 These latent defects can lead to significant cost overruns, costly rework, or, most critically, compromised structural performance later in the building's service life. This manual, therefore, is the primary tool to identify and control these unique risks at their source, ensuring that every printed structure is built to last and meets the highest standards of safety and quality.1

#### **1.1.2. Application**

This manual is a controlled document and its application is mandatory for all personnel involved in the 3DCP process, including Project Managers, Materials Operators, and Printer Operators.5 It is the foundational document upon which compliance with the project's structural engineering requirements is demonstrated. All test results, records, and reports generated under the guidance of this manual will form the core of the quality assurance dossier submitted to the Structural Engineer and Specialist Building Surveyor for certification and regulatory approval.1 Adherence to these protocols is non-negotiable for maintaining the integrity of the construction process and the final product.

### **1.2. Governing Principles and Standards**

The quality framework detailed in this manual is built upon a synthesis of established national standards and emerging international best practices for additive construction.

#### **1.2.1. Foundation in Australian Standards (AS)**

The procedural basis for all conventional concrete tests referenced within this manual is the Australian Standard AS 1012 series, *Methods of testing concrete*. This series provides a comprehensive and widely accepted framework for sampling and testing, ensuring that our fundamental testing practices align with the established norms of the Australian construction industry.1 Specific parts of the AS 1012 series, such as those for sampling (AS 1012.1), slump testing (AS 1012.3.1), and compressive strength testing (AS 1012.9), form the bedrock of the protocols that follow.8

#### **1.2.2. Adoption of ISO/ASTM 52939:2023**

This manual formally adopts the high-level quality assurance framework outlined in the international standard ISO/ASTM 52939:2023, *Additive manufacturing for construction — Qualification principles — Structural and infrastructure elements*.11 While this new standard does not prescribe specific test methods, it provides an essential, process-oriented framework for quality management in additive construction.13 It specifies criteria for process control, quality-relevant characteristics, and the sequence of activities within a construction project.15 By aligning with ISO/ASTM 52939:2023, this QMS demonstrates a commitment to international best practices and ensures that our internal processes are structured in a way that is recognized and defensible on a global scale, a crucial step for a maturing technology.11

#### **1.2.3. Alignment with NATA Principles (ISO/IEC 17025\)**

While the on-site team does not operate as a formally accredited laboratory, the principles of ISO/IEC 17025, *General requirements for the competence of testing and calibration laboratories*, will be rigorously applied to all testing and documentation activities.18 This commitment to a higher standard of practice is essential for producing data that is reliable, repeatable, and defensible under the scrutiny of engineers and regulators. Key principles adopted from this framework include:

* **Equipment Management:** All testing equipment must be regularly calibrated and maintained according to the schedules defined in this manual and the relevant Australian Standards. Calibration records must be meticulously kept.1  
* **Method Validation:** For novel, non-standard tests developed specifically for 3DCP, this manual provides documented, validated procedures. Any deviation from a standard method must be justified, documented, and approved.18  
* **Personnel Competency:** All personnel conducting tests must be trained and deemed competent in the specific procedures outlined in this manual. Training records will be maintained.1  
* **Traceability and Reporting:** The documentation system is designed to ensure complete traceability of results and to report data in a clear, unambiguous format, mirroring the requirements for NATA-accredited reports.18

### **1.3. Critical Differences: 3DCP vs. Conventional Concrete**

The necessity for this specialized manual stems from fundamental differences between 3D printed concrete and conventionally cast concrete. These differences alter the material's behaviour, introduce new failure modes, and demand a more sophisticated approach to quality control. An understanding of these distinctions is crucial for all project stakeholders. The following table provides a high-level comparison.

**Table 1: Comparison of Conventional vs. 3DCP Quality Control Paradigms**

| Feature | Conventional Concrete (e.g., AS 3600\) | 3D Printed Concrete (3DCP) | Implication for this Manual |
| :---- | :---- | :---- | :---- |
| **Material Structure** | Largely Isotropic (Uniform properties in all directions) | Inherently Anisotropic (Directionally dependent properties) 21 | All hardened property tests must be conducted in three principal axes relative to the print direction. |
| **Critical Interface** | Planned construction joints | Inter-layer "cold" bond (inherent in every layer) 4 | Requires a dedicated Inter-Layer Bond Strength test (Protocol 08\) to quantify the weakest link. |
| **Fresh State Goal** | Workability (Ease of placing & compacting in formwork) 1 | Printability (A balance of Pumpability, Extrudability, and Buildability) 21 | Requires a suite of fresh-state tests beyond slump, including specific assessments for extrudability and buildability (Protocols 02, 03). |
| **Hardening Support** | Temporary Formwork | Self-supporting from the moment of deposition (Green Strength) 25 | The Buildability test (Protocol 03\) is critical to prevent plastic collapse during construction. |
| **Primary Strength Metric** | Compressive Strength (AS 1012.9) 1 | Compressive Strength (Anisotropic) & Inter-layer Bond Strength 22 | Compressive strength is still vital but is insufficient on its own and must be evaluated directionally. Bond strength is equally critical. |
| **Compaction** | Mechanical Vibration | None (or minimal via pump pressure) | Porosity and voids, especially at layer interfaces, are a primary concern affecting both strength and durability.17 |
| **Mix Design** | Balanced mix with coarse and fine aggregates. | Typically high-paste, fine-aggregate mixes with complex admixture packages.21 | Mix is highly sensitive to environmental factors; increased susceptibility to shrinkage requires dedicated testing (Protocol 10). |

The core takeaway from these differences is that quality control for 3DCP cannot be a simple adaptation of conventional methods. It requires a new paradigm that directly addresses anisotropy and inter-layer bonding as the primary technological risks. Reporting a single, non-directional compressive strength value for a 3DCP element is technically incomplete and potentially misleading. This manual is designed to implement the more rigorous, multi-faceted testing regime that this new technology demands.

### **1.4. Glossary of Terms**

For clarity and consistency, the following definitions shall apply throughout this manual and all associated documentation.

* **Additive Construction (AC):** The overarching term for the construction segment that uses additive manufacturing processes. It encompasses all relevant disciplines, including architecture, materials engineering, and robotics.15 Synonymous with 3D Construction Printing (3DCP).  
* **Anisotropy:** The property of a material exhibiting different physical properties (e.g., strength) when measured along different axes. In 3DCP, this is due to the layered structure.21  
* **Buildability:** The ability of a freshly printed filament to preserve its vertical and lateral stability under the increasing load of subsequent layers with controlled deformation. A measure of the material's resistance to plastic collapse or buckling during the printing process.15  
* **Composite Sample:** A concrete sample formed by combining three or more sample increments, mixed to ensure uniformity, as per AS 1012.1.31  
* **Extrudability:** The ability of the concrete mix to be smoothly ejected through the printing nozzle to form a continuous, cohesive filament without blockage, tearing, or segregation.15  
* **Green Strength:** The strength of the concrete in its fresh, unhardened state. This property is what allows a printed layer to support the weight of subsequent layers.23  
* **Inter-layer Bond Strength:** The tensile or shear strength of the interface between two successively printed layers of concrete. This is often the weakest plane in a 3DCP element.21  
* **Open Time:** The period after initial mixing during which the concrete remains workable and meets all specified fresh property requirements for pumpability, extrudability, and buildability.21  
* **Plastic Viscosity (μ):** A measure of a fluid's resistance to flow under shear. Along with yield stress, it defines the rheological behaviour of the fresh mix.29  
* **Printability:** A composite property encompassing the material's ability to be successfully pumped, extruded, and built up into a stable structure. It is the combination of flowability, extrudability, and buildability.15  
* **Pumpability:** The ability of the fresh concrete mix to be transported through hoses and pipes under pressure without segregation or blockage.15  
* **Rheology:** The study of the flow of matter. For 3DCP, it is the science governing the fresh-state properties that determine printability.23  
* **Thixotropy:** The property of a material to exhibit a time-dependent decrease in viscosity under shear (i.e., it becomes more fluid when pumped/mixed) and to recover its stiffness when at rest. High thixotropy is desirable for buildability.29  
* **Yield Stress (τ0​):** The minimum shear stress required to initiate flow in the fresh concrete. A high static yield stress is required for buildability, while a low dynamic yield stress is required for pumpability.29

## **Part 2: Protocol for Material Constituent Verification**

The quality of the final printed concrete is fundamentally dependent on the quality of its constituent materials. Rigorous verification of all incoming raw materials is the first and most critical step in the quality control process. Failure to control the quality of inputs will invariably lead to non-conforming outputs, wasted material, and project delays.

### **2.1. Incoming Raw Materials**

All deliveries of cement, sand (fine aggregate), and chemical admixtures must undergo the following verification procedure before being accepted for use.

#### **2.1.1. Procedure**

1. **Documentation Check:** Upon arrival of a delivery, the Materials Operator shall obtain the delivery docket and the supplier's Certificate of Conformity or Certificate of Analysis. This documentation must be cross-referenced against the project's material specifications to confirm that the correct product, grade, and type has been delivered. Any discrepancies shall result in the immediate quarantining of the material pending clarification from the supplier and Project Manager.  
2. **Visual Inspection:** The Materials Operator shall conduct a thorough visual inspection of the delivered materials.  
   * **Cement & Other Powders:** Check for any signs of moisture ingress (e.g., clumping, lumps) in bags or silos. The powder should be free-flowing.  
   * **Sand/Aggregates:** Check for contamination with foreign materials (e.g., clay, organic matter, debris) and for excessive segregation of particle sizes.  
   * **Liquid Admixtures:** Check that containers are sealed and undamaged. Verify the product's appearance (colour, clarity) against the manufacturer's data sheet.  
3. **Labeling and Traceability:** Confirm that every bag, container, or silo is clearly and indelibly labeled with the following information:  
   * Product Name and Manufacturer  
   * Batch or Lot Number  
   * Date of Manufacture  
   * Use-by or Expiry Date (for admixtures and cement)  
4. **Record Keeping:** All details from the delivery docket and certificate of conformity, including batch numbers, shall be logged in the **Daily Print & Materials Log** (see Part 6). This creates a crucial link in the traceability chain from raw material to the final printed structure.8

Any material that fails any part of this inspection shall be clearly marked as "NON-CONFORMING \- DO NOT USE" and physically segregated from approved stock. The Project Manager must be notified immediately.

### **2.2. Storage and Handling**

Proper storage and handling are essential to maintain the quality of the verified materials until they are used. The following conditions must be maintained at all times.

#### **2.2.1. Procedure**

1. **Cement and Dry Powders:** All cementitious materials must be stored in a dry, weatherproof environment to protect them from humidity and moisture. Silos must be sealed. Bagged cement must be stored on pallets off the ground and covered.8 The principle of "First-In, First-Out" (FIFO) shall be applied to ensure older stock is used first.  
2. **Aggregates:** Stockpiles of sand must be stored on a clean, hard, non-contaminating surface (e.g., a concrete hardstand) and managed to prevent segregation and contamination from windblown dust or other site materials.8 Measures should be taken to maintain a relatively consistent moisture content, such as covering stockpiles.  
3. **Chemical Admixtures:** Liquid admixtures must be stored in sealed containers in a location that protects them from direct sunlight and temperature extremes (freezing or excessive heat), in strict accordance with the manufacturer's recommendations.8 Admixtures must not be used beyond their specified shelf life. Before use, containers that have been stored for some time should be agitated or stirred as per manufacturer instructions to ensure homogeneity.  
4. **Environmental Factors:** The ambient temperature and humidity of the storage areas should be considered, as prolonged exposure to extreme conditions can degrade materials.33

## **Part 3: Fresh Concrete Property Testing Protocols**

The properties of the concrete in its fresh, plastic state are the most critical determinant of a successful print. Unlike conventional concrete, where the primary concern is workability for placement in formwork, 3DCP demands a delicate and often contradictory balance of rheological properties.

### **3.1. Introduction to Fresh State Testing for 3DCP**

The "printability" of a concrete mix is not a single property but a combination of three key characteristics that must be satisfied simultaneously.24 This has been termed the rheological trilemma:

1. **Pumpability/Flowability:** The mix must be fluid enough to be pumped through potentially long hoses to the printhead without requiring excessive pressure, which can lead to segregation, blockages, or heating of the mix.15  
2. **Extrudability:** Upon reaching the nozzle, the mix must be cohesive and stiff enough to be extruded as a stable, continuous filament that holds its shape without tearing, slumping, or segregating. This requires a certain minimum yield stress.15  
3. **Buildability:** Immediately after deposition, the filament must rapidly gain sufficient stiffness (static yield stress or "green strength") to support its own weight and the weight of many subsequent layers without deforming excessively or collapsing. This property is governed by the material's thixotropy and structuration rate.25

The on-site tests detailed in this section are designed as practical, rapid quality control checks. Their purpose is not to perform a complete rheological characterization, which is the domain of laboratory equipment, but to verify batch-to-batch consistency and confirm that the material produced on-site conforms to the pre-qualified mix design.25

### **3.2. Protocol 01: Consistency (Slump Test)**

#### **3.2.1. Standard**

AS 1012.3.1: *Methods of testing concrete \- Determination of properties related to the consistency of concrete — Slump test*.1

#### **3.2.2. Purpose and Application in 3DCP**

The slump test serves as the primary, first-line quality control check for every batch of concrete mixed. It provides a rapid, simple, and effective indication of the mix's consistency and uniformity, primarily reflecting variations in the water-to-cementitious materials ratio.1

While it is a poor direct predictor of the complex property of buildability, its value in the 3DCP workflow is as a "gateway" test.25 It provides a quick pass/fail assessment to detect gross errors in batching before more time-consuming and material-intensive tests are performed. A batch that passes the slump test proceeds to further QC checks; a batch that fails is immediately quarantined for investigation. This structured approach, using a simple test recommended by practitioners like COBOD 5 as a coarse filter, prevents the waste of time and resources on material that is clearly non-conforming.

#### **3.2.3. Equipment**

* **Slump Cone:** Standard mould conforming to AS 1012.3.1, with internal dimensions of 200 mm base diameter, 100 mm top diameter, and 300 mm height.38  
* **Base Plate:** A smooth, rigid, non-absorbent, and level base plate.38  
* **Tamping Rod:** A straight steel rod, 16 mm in diameter, approximately 600 mm long, with a hemispherical tip.40  
* **Scoop:** A scoop of at least 1 L capacity.38  
* **Ruler or Measuring Tape:** Graduated in millimeters.

#### **3.2.4. Procedure**

1. **Preparation:** Ensure the internal surface of the slump cone and the surface of the base plate are clean, damp, but free of any excess water.38  
2. **Positioning:** Place the cone on the base plate on a level, stable surface, free from vibration. Hold the cone firmly in place by standing on the footpieces or using a clamping base.38  
3. **Filling (Layer 1):** Fill the cone with the first layer of concrete to approximately one-third of its height (approx. 70 mm deep).38  
4. **Rodding (Layer 1):** Compact the layer with 25 strokes of the tamping rod, distributed uniformly over the cross-section. For the bottom layer, the rod should be slightly inclined for strokes near the perimeter to ensure full compaction.38  
5. **Filling (Layer 2):** Fill the cone with the second layer to approximately two-thirds of its height (approx. 160 mm deep from the base).38  
6. **Rodding (Layer 2):** Compact the layer with 25 strokes, ensuring the rod penetrates approximately 25 mm into the first layer.40  
7. **Filling (Layer 3):** Fill the cone with the third layer, heaping the concrete above the top of the mould.38  
8. **Rodding (Layer 3):** Compact the layer with 25 strokes, ensuring the rod penetrates into the second layer. Maintain an excess of concrete throughout the rodding.39  
9. **Strike-Off:** After rodding the final layer, strike off the surplus concrete level with the top of the cone using a screeding and rolling motion of the tamping rod.38  
10. **Clean Base:** Immediately clean away any spilled concrete from around the base of the cone.39  
11. **Lift Cone:** Remove the cone by lifting it carefully and vertically upwards in a single, steady motion. This operation must be completed in 3 ± 1 seconds, without any lateral or twisting movement.38  
12. **Measure Slump:** Immediately after removing the cone, measure the vertical distance between the top of the cone (or a straightedge placed across the inverted cone) and the displaced center of the top surface of the slumped concrete. Record the slump to the nearest 5 mm.38  
13. **Assess Slump Type:** Note the type of slump. If the specimen collapses or shears laterally, the test is invalid and must be repeated with a fresh sample.39 A "true slump" is required for a valid result.

#### **3.2.5. Acceptance Criteria**

A target slump value and an acceptable tolerance range (e.g., 80 mm ± 15 mm) will be defined in the project-specific mix design qualification report. Any batch of concrete producing a slump outside this specified range is considered non-conforming and must be immediately reported to the Project Manager.

### **3.3. Protocol 02: Extrudability Assessment**

#### **3.3.1. Standard**

No Australian or international standard currently exists for this test. This protocol is a project-specific procedure developed from industry best practices and academic research to provide a qualitative and semi-quantitative assessment of extrudability.21

#### **3.3.2. Purpose**

This test is performed immediately after a successful slump test to assess if the concrete can be extruded through the printer's nozzle to form a stable, continuous, and well-formed filament. It is a direct check on the properties required for the deposition phase of the printing process.

#### **3.3.3. Equipment**

* The 3DCP printer system (pump and nozzle).  
* A flat, clean, non-absorbent surface (e.g., a large plastic sheet or metal plate).  
* A photographic camera for record-keeping.  
* (Optional) A calibrated hand-held vane shear tester.

#### **3.3.4. Procedure**

1. **Preparation:** Ensure the pump and hose system are primed and ready for operation.  
2. **Extrusion:** Using the concrete from the batch that passed the slump test, operate the pump to extrude a continuous filament of concrete, approximately 2 meters long, onto the prepared flat surface. The pump and printer settings (e.g., flow rate) should be set to the standard production parameters.  
3. **Visual Assessment:** Immediately inspect the extruded filament and record observations against the following criteria:  
   * **Continuity:** Does the filament maintain a continuous, unbroken line, or does it tear or exhibit blockages?  
   * **Edge Definition:** Are the edges of the filament sharp and consistent with the nozzle shape, or are they slumping, irregular, or bulging?  
   * **Surface Texture:** Is the surface relatively smooth, or does it show signs of excessive tearing (a phenomenon sometimes called "shark-skinning")?  
   * **Cohesion & Segregation:** Is the filament cohesive, or is there evidence of bleeding (water separating from the mix) or segregation of sand particles?  
4. **Photographic Record:** Take a clear photograph of the extruded filament alongside a label indicating the batch ID and time. This photo will be attached to the Fresh Concrete Test Record.  
5. **(Optional) Vane Test:** As a semi-quantitative check, the Materials Operator may use a hand-held vane tester on the bulk fresh mix in the hopper. This test, recommended by COBOD 5, provides a proxy measurement of the material's static yield stress. The reading should be recorded.

#### **3.3.5. Acceptance Criteria**

* **Qualitative:** The extruded filament must be continuous, cohesive, and exhibit well-defined edges with no significant slumping, tearing, or segregation. A project-specific photographic reference guide showing examples of "Acceptable" and "Unacceptable" filaments will be used for comparison.  
* **Quantitative (if Vane Test is used):** The vane shear strength reading must fall within a pre-determined range established during the mix design qualification phase.

### **3.4. Protocol 03: Buildability Assessment**

#### **3.4.1. Standard**

No standard exists for this test. This is the most critical project-specific protocol for fresh concrete, designed to simulate the real-world printing process and verify the material's ability to be self-supporting.21

#### **3.4.2. Purpose**

To provide direct, physical evidence that the fresh concrete mix possesses sufficient green strength and dimensional stability to support the load of successively deposited layers without causing plastic collapse or excessive deformation (buckling). This test is the ultimate on-site verification of a mix's fitness for purpose before commencing production printing.

#### **3.4.3. Equipment**

* The complete 3DCP printer system.  
* A level and stable printing surface.  
* Measuring tape or laser distance meter.

#### **3.4.4. Procedure**

1. **Frequency:** This test shall be performed at the start of every printing day and whenever a new mix design is being qualified.  
2. **Test Object:** Using concrete from a batch that has passed both the Slump Test (Protocol 01\) and the Extrudability Assessment (Protocol 02), print a standardized test object. The standard object shall be a hollow cylinder with an external diameter of approximately 300 mm and a wall thickness corresponding to the production nozzle width.  
3. **Printing Process:** Print the test object continuously, using the same printing speed, layer height, and other parameters planned for the main production run. Do not pause between layers unless it is part of the failure criteria assessment.  
4. **Observation and Measurement:** Continue printing layers until one of the following occurs:  
   * **Success:** A pre-determined target height (e.g., 1.5 meters, or a height specified by the structural engineer) is reached successfully without visible signs of distress.  
   * **Failure:** The structure fails. Failure is defined as either:  
     * **Plastic Collapse:** The material at the base layers visibly bulges or squashes outwards under the load of the layers above.  
     * **Elastic Buckling:** The entire structure exhibits significant lateral deformation and instability, leading to collapse.  
5. **Recording:** Record the outcome of the test: either "Pass" (target height achieved) or "Fail." If failure occurs, record the failure mode (collapse or buckling) and the total height (in mm) and number of layers achieved before failure.

#### **3.4.5. Acceptance Criteria**

The concrete mix is deemed to have passed the buildability assessment if the standard test object can be printed to the specified target height without failure or without exhibiting lateral deformation that exceeds a pre-defined limit (e.g., 5 mm from vertical over the full height). Any failure to meet the target height constitutes a non-conformance.

### **3.5. Protocol 04: Open Time Determination**

#### **3.5.1. Standard**

No standard exists. This protocol is based on methods described in academic literature and is primarily used during the initial qualification phase of a new mix design.21

#### **3.5.2. Purpose**

To scientifically determine the maximum time window following initial mixing during which the concrete mix remains fully "printable"—that is, it continues to meet all specified acceptance criteria for slump, extrudability, and buildability. This value is critical for on-site logistics, defining the maximum allowable time from batching to final deposition.

#### **3.5.3. Procedure**

1. **Frequency:** This test is performed once for each new mix design to qualify it for use. It is not a routine daily test.  
2. **Sample Preparation:** Prepare a single, large batch of the concrete mix to be qualified, ensuring it is of sufficient volume to conduct multiple sets of tests. Start a timer at the moment water is first added to the mixer (T=0).  
3. **Time-Interval Testing:** At regular, pre-defined time intervals (e.g., T=0, T=15 min, T=30 min, T=45 min, T=60 min, etc.), take a representative sample from the batch and perform the full suite of fresh property tests:  
   * Slump Test (Protocol 01\)  
   * Extrudability Assessment (Protocol 02\)  
4. **Data Recording:** For each time interval, meticulously record the results of all tests. Note the exact time at which any one of the properties fails to meet its specified acceptance criteria.  
5. **Buildability Check:** While a full buildability test at each interval may be impractical, a final buildability test (Protocol 03\) should be conducted at the last time interval where both slump and extrudability were still acceptable, to confirm the material's performance.

#### **3.5.4. Acceptance Criteria**

The "Open Time" for the mix design is officially defined as the last time interval at which **all** fresh property tests were successfully passed. For example, if the mix passed all tests at T=30 minutes but the slump was too low at T=45 minutes, the official Open Time for that mix design is 30 minutes. This determined Open Time will be documented in the mix design report and will serve as a strict operational limit on site.

## **Part 4: Hardened Concrete Property Testing Protocols**

The testing of hardened concrete is essential to verify that the printed structure possesses the mechanical strength and durability assumed in the structural design. For 3DCP, this is significantly more complex than for conventional concrete due to the material's inherent anisotropy.

### **4.1. Introduction to Anisotropy in Hardened 3DCP**

A monolithic block of conventionally cast concrete is largely isotropic, meaning its strength is roughly the same regardless of the direction in which it is loaded. In contrast, a 3D printed element is inherently anisotropic due to its layered construction.21 The strength and stiffness of the material depend critically on the direction of the applied load relative to the printed layers. Failing to account for this anisotropy can lead to a gross overestimation of the structure's capacity.

Therefore, for all hardened property tests, it is mandatory to test specimens in three principal axes, which are defined relative to the printed element (e.g., a wall) as follows 17:

* **Axis 1 (Perpendicular, or Z-axis):** The load is applied **perpendicular** to the plane of the printed layers. This orientation typically tests the compressive strength across the layers or the inter-layer bond itself.  
* **Axis 2 (Parallel-Longitudinal, or X-axis):** The load is applied **parallel** to the layers and **along** the direction of printing (i.e., along the length of the filament).  
* **Axis 3 (Parallel-Transverse, or Y-axis):** The load is applied **parallel** to the layers but **across** the direction of printing (i.e., perpendicular to the filament direction).

Research has demonstrated that strength values can vary significantly between these axes, with compressive strength in the perpendicular direction (Axis 1\) sometimes being as low as 59% of that of a cast sample, while the parallel direction (Axis 2\) might achieve 85%.22 It is therefore imperative that all test reports for hardened 3DCP clearly state the orientation of the specimen tested.

### **4.2. Protocol 05: Compressive Strength**

#### **4.2.1. Standard**

AS 1012.9: *Methods of testing concrete \- Determination of the compressive strength of concrete specimens*.1

#### **4.2.2. Purpose**

To determine the uniaxial compressive strength of the hardened concrete. This remains a fundamental property for design, but it must be evaluated in all three principal axes to fully characterize the material's anisotropic behaviour.

#### **4.2.3. Specimens**

Specimens shall be either:

* **Cast Cylinders:** 100 mm diameter x 200 mm long cylinders cast from a representative fresh concrete sample as per Protocol 5.1.2.  
* **Cored Cylinders:** Cylinders of the same dimension cored from a hardened printed element (e.g., a test wall or the actual structure) as per Protocol 5.1.3. Cored specimens must be carefully labeled to preserve their original orientation (Axis 1, 2, or 3).

#### **4.2.4. Procedure**

1. **Curing:** Cure specimens in accordance with AS 1012.8.1 under standard conditions (e.g., in a lime-saturated water bath) until the age of testing.42  
2. **Preparation:** Prior to testing, ensure the loading ends of the cylinders are plane and perpendicular to the specimen's axis. If they do not meet the tolerances specified in AS 1012.9, they must be prepared by either grinding or capping with a suitable material (e.g., sulphur mixture or rubber caps).10  
3. **Testing:** At the specified age (typically 7, 14, and 28 days), place the specimen in a calibrated compression testing machine. Apply the load at a constant rate as specified in AS 1012.9 until the specimen fails.  
4. **Recording:** Record the maximum load sustained by the specimen. Note the type of failure (e.g., normal, shear).  
5. **Calculation:** Calculate the compressive strength by dividing the maximum load by the cross-sectional area of the specimen. Report the result in Megapascals (MPa).

#### **4.2.5. Acceptance Criteria**

The acceptance criteria will be specified by the structural engineer and will likely include minimum required strengths for each of the three principal axes at 28 days. As a general principle, the design must be based on the strength achieved in the *weakest* orientation. For example, if the specification requires 40 MPa, this strength must be achieved in all three directions.

### **4.3. Protocol 06: Indirect Tensile Strength (Splitting Tensile)**

#### **4.3.1. Standard**

AS 1012.10: *Methods of testing concrete \- Determination of indirect tensile strength of concrete cylinders ('Brazil' or splitting test)*.43

#### **4.3.2. Purpose**

To determine the tensile strength of the hardened concrete. In 3DCP, this test is particularly useful for evaluating the bond strength *between adjacent filaments within the same layer* (intra-layer bond), as this interface represents a potential plane of weakness.

#### **4.3.3. Procedure**

1. **Specimens:** Use standard cylindrical specimens, either cast or cored. If cored, the axis of the core should be taken parallel to the print bed (i.e., in the X-Y plane).  
2. **Testing:** Place the cylinder horizontally in the compression testing machine and apply a compressive line load along its length, as described in AS 1012.10. The compressive load induces a tensile stress across the vertical diameter, causing the cylinder to split.  
3. **Orientation:** The cylinder should be oriented such that the potential weak plane between adjacent filaments is aligned with the vertical splitting plane.  
4. **Calculation:** Calculate the splitting tensile strength based on the maximum load and the specimen dimensions as per the formula in the standard.

#### **4.3.4. Acceptance Criteria**

A minimum splitting tensile strength value as specified by the structural engineer. This provides confidence in the material's ability to resist tensile stresses that may arise from shrinkage or other loads.

### **4.4. Protocol 07: Flexural Strength (Modulus of Rupture)**

#### **4.4.1. Standard**

AS 1012.11: *Methods of testing concrete \- Determination of the modulus of rupture*.9

#### **4.4.2. Purpose**

To determine the tensile strength of the concrete in bending. This property is highly sensitive to defects and is a critical indicator of the performance of the inter-layer bond, as flexural failure often initiates at the weakest layer interface.

#### **4.4.3. Specimens**

Prismatic beams (e.g., 100x100x350 mm or 150x150x500 mm) prepared in one of two ways:

* **Cast Beams:** Cast from a representative fresh concrete sample as per AS 1012.8.2.44  
* **Cut Beams:** Cut from a larger printed element. Specimens must be cut to represent different orientations relative to the print direction.

#### **4.4.4. Procedure**

1. **Curing and Preparation:** Cure specimens as per AS 1012.8.2. Ensure they are kept wet until testing.9  
2. **Testing Setup:** Test the beam as a simple beam with third-point loading, as specified in AS 1012.11.  
3. **Orientation:** It is mandatory to test beams in at least two orientations:  
   * **On-edge:** The layers are vertical, and the load is applied parallel to the layer interfaces.  
   * **On-face:** The layers are horizontal, and the load is applied perpendicular to the layer interfaces, placing the bottom-most inter-layer bond in maximum tension. This is often the most critical test orientation.45  
4. **Calculation:** Calculate the modulus of rupture (fcf​) based on the maximum applied load and the beam dimensions, as per the formula in AS 1012.11.

#### **4.4.5. Acceptance Criteria**

Minimum modulus of rupture values for each test orientation, as specified by the structural engineer. It is expected that the acceptance criteria for the "on-face" orientation may be lower than for the "on-edge" orientation, reflecting the anisotropic nature of the material.22

### **4.5. Protocol 08: Inter-Layer Bond Strength**

#### **4.5.1. Standard**

No Australian Standard exists. This is the most important 3DCP-specific test protocol, derived from established academic research methodologies to directly quantify the strength of the weakest link in the printed structure.21

#### **4.5.2. Purpose**

To directly measure the tensile strength of the adhesive and mechanical bond formed between two successively printed layers of concrete. A low inter-layer bond strength is the primary failure mode of concern for 3DCP.

#### **4.5.3. Method Selection**

The structural engineer shall select one of the following methods for project qualification. The chosen method must be used consistently throughout the project.

* **Method A: Direct Tension Test**  
  * **Specimen:** A "dog-bone" or waisted cylindrical specimen is printed, with the inter-layer bond located precisely at the narrowest cross-section to ensure failure occurs at the interface.  
  * **Procedure:** The ends of the specimen are gripped in a universal testing machine, and a direct tensile load is applied until failure.  
  * **Advantage:** Provides a true measure of tensile bond strength.  
  * **Disadvantage:** Specimen preparation and testing can be complex.  
* **Method B: Splitting Tensile Test (Modified for Bond)**  
  * **Specimen:** A standard cubic or cylindrical specimen, either cast or cut, comprising at least two layers with the bond plane clearly identifiable.  
  * **Procedure:** The specimen is placed in a compression machine and tested as per the splitting tensile test (Protocol 06), but with the critical orientation where the bond plane lies on the vertical diameter that will be split by the induced tensile stress.28  
  * **Advantage:** Uses standard equipment and a relatively simple setup.  
  * **Disadvantage:** It is an indirect measure of tensile strength.  
* **Method C: Three-Point Bending Test (Notched)**  
  * **Specimen:** A small beam specimen is printed or cut, with the inter-layer bond located at the mid-span. A small notch is carefully cut along the bond line on the tension face to promote failure initiation at the interface.45  
  * **Procedure:** The beam is tested under three-point bending, with the load applied directly opposite the notch.  
  * **Advantage:** Relatively simple test that provides data on both bond strength and fracture energy.  
  * **Disadvantage:** Results can be influenced by notch geometry.

#### **4.5.4. Documented Procedure**

Once a method is selected, a detailed, step-by-step procedure for that specific method, including precise specimen dimensions, preparation techniques, and testing machine parameters, will be documented in a project-specific addendum to this manual.

#### **4.5.5. Acceptance Criteria**

This is a key performance indicator (KPI) that must be defined by the structural engineer. The acceptance criterion is typically expressed as a percentage of the parent material's strength. For example: "The average inter-layer bond strength, as measured by Method B, must be no less than 80% of the splitting tensile strength of a comparable cast specimen."

### **4.6. Protocol 09: Durability \- Water Absorption**

#### **4.6.1. Standard**

AS 1012.21: *Methods of testing concrete \- Determination of water absorption and apparent volume of permeable voids in hardened concrete*.46

#### **4.6.2. Purpose**

To assess the potential long-term durability of the printed concrete by measuring its susceptibility to water ingress. This is particularly important for 3DCP, as the inter-layer regions and any process-induced voids can act as preferential pathways for water and aggressive chemicals (e.g., chlorides, sulfates), potentially compromising the structure's service life.22

#### **4.6.3. Procedure**

1. **Specimens:** Test specimens shall be cores of a specified diameter (e.g., 75 mm) and height, extracted from a printed test wall or element to be representative of the as-built material.51  
2. **Drying:** Dry the specimens in a ventilated oven at a specified temperature until a constant mass is achieved.  
3. **Immersion:** After cooling, immerse the specimens in water for a specified period (e.g., 30 minutes for the immersed absorption test, Ai).  
4. **Measurement:** Remove the specimens, wipe off surface water, and weigh them.  
5. **Calculation:** Calculate the water absorption as the percentage increase in mass relative to the oven-dry mass, as per the formula in AS 1012.21.48

#### **4.6.4. Acceptance Criteria**

A maximum allowable water absorption percentage will be specified by the structural engineer based on the project's durability requirements and exposure conditions.

### **4.7. Protocol 10: Durability \- Drying Shrinkage**

#### **4.7.1. Standard**

AS 1012.13: *Methods of testing concrete \- Determination of the drying shrinkage of concrete*.52

#### **4.7.2. Purpose**

To measure the potential for volume change due to moisture loss, which can lead to cracking. 3DCP materials are considered highly susceptible to drying shrinkage due to their typical mix designs (high cement content, low water-to-binder ratio, lack of coarse aggregate) and the formwork-free construction method, which exposes a large surface area to the environment from a very early age.26

#### **4.7.3. Procedure**

1. **Specimen Adaptation:** The standard method, which uses moulded beams, must be adapted for 3DCP. Small, prismatic specimens (e.g., 75x75x285 mm) shall be printed directly. Gauge studs for length measurement must be embedded into the fresh concrete at the ends of the printed specimen immediately after printing.  
2. **Curing:** Specimens shall be cured under conditions that replicate the on-site curing regime for a specified initial period (e.g., 24 hours).  
3. **Measurement:** After the initial curing, take an initial length reading. Then, store the specimens in a controlled environment (e.g., 23°C and 50% relative humidity as per AS 1012.13) and take length measurements at regular intervals (e.g., 7, 14, 28, 56 days).52  
4. **Calculation:** Calculate the drying shrinkage as the change in length per unit length, typically expressed in microstrains (με).

#### **4.7.4. Acceptance Criteria**

A maximum allowable drying shrinkage strain at a specified age (e.g., 28 or 56 days) will be set by the structural engineer to minimize the risk of uncontrolled cracking.

## **Part 5: Process Control: Sampling, Frequency, and Environment**

Effective quality control relies on a systematic and disciplined approach to sampling, testing frequency, and environmental management. This section defines the operational workflow for the on-site team.

### **5.1. Sampling Procedures**

The validity of any test result is entirely dependent on the quality of the sample taken. A non-representative sample will yield a meaningless result. A dual approach to sampling for hardened properties is mandated to capture both the potential quality of the material and the actual quality of the as-built structure.

#### **5.1.1. Fresh Concrete Sampling**

* **Standard:** AS 1012.1: *Methods of testing concrete \- Sampling of fresh concrete*.53  
* **Procedure:** To obtain a representative sample for all fresh property tests and for casting hardened specimens, a composite sample must be taken.  
  1. The sample shall be taken from the point of discharge (i.e., from the concrete pump outlet before the nozzle).  
  2. Take at least three separate increments of approximately equal volume at regular intervals during the discharge of a single batch.31 Do not take samples from the very beginning or very end of the discharge.  
  3. Combine the increments on a clean, non-absorbent mixing surface (e.g., a moistened mixing tray or wheelbarrow).  
  4. Thoroughly mix the combined increments with a scoop or shovel to form a single, uniform composite sample before conducting any tests.31  
  5. The entire sampling and mixing process shall not exceed 20 minutes.31

#### **5.1.2. Hardened Concrete Specimen Preparation (Cast Specimens)**

* **Standard:** AS 1012.8.1 (Compression/Tensile Cylinders) & AS 1012.8.2 (Flexure Beams).8  
* **Procedure:** From the composite sample obtained in 5.1.1, cast the required number of specimens for hardened property testing.  
  1. Use clean, oiled (if required) moulds that conform to the dimensions in the standard.42  
  2. Fill the moulds in the specified number of layers (e.g., two or three layers for cylinders, depending on size).42  
  3. Compact each layer with the specified number of strokes from the tamping rod, ensuring uniform compaction.  
  4. Strike off the surface to be level with the top of the mould.  
  5. Label each specimen with a unique ID that is traceable to the batch number and date.  
  6. Place specimens in initial curing immediately, protecting them from moisture loss and temperature fluctuations as per AS 1012.8.1.42

#### **5.1.3. Hardened Concrete Specimen Preparation (Cored Specimens)**

* **Standard:** AS 1012.14: *Methods of testing concrete \- Securing, preparing and testing cores from hardened concrete*.56  
* **Procedure:** To verify the as-built properties of the printed structure, core samples shall be extracted.  
  1. **Location:** Select core locations in consultation with the structural engineer, avoiding reinforcement where possible by using a cover meter or GPR.56  
  2. **Drilling:** Use a diamond core drill to carefully extract the core, minimizing vibration and damage to the surrounding concrete.56  
  3. **Labeling:** Immediately upon extraction, label each core with a unique ID, its location, and its original orientation (e.g., mark the "top" or "outer" face and indicate the print direction).56 This is critical for anisotropic testing.  
  4. **Preparation:** Trim the ends of the core to be flat and parallel. Prepare for testing (capping or grinding) as per the relevant test protocol.

The use of both cast and cored specimens is a deliberate strategy. Cast specimens are used for high-frequency process control, providing rapid feedback on the consistency of the material being produced. Cored specimens serve as a lower-frequency, but critically important, verification of the final, in-situ properties of the structure. The printing process itself—including pumping pressures, extrusion, and the lack of vibration—can alter the concrete's density and create voids, often resulting in lower strength in the printed element compared to an ideally compacted cast specimen.17 The comparison between cast and cored results provides invaluable data for process optimization and serves as the ultimate proof of performance for the structural engineer.

### **5.2. Schedule of Testing Frequency**

The following master schedule defines the minimum testing frequency required for all projects. The Project Manager or Structural Engineer may specify a higher frequency for critical structural elements.

**Table 2: Master Schedule of Testing Frequency & Sampling**

| Test (Protocol \#) | Frequency | Sample Type & Size | Responsibility |
| :---- | :---- | :---- | :---- |
| **Incoming Material Check** | Every delivery | Visual inspection & documentation review | Materials Operator |
| **Fresh Properties** |  |  |  |
| Slump (01) | **Each batch** of concrete mixed. | Composite sample from mixer/pump. | Materials Operator |
| Extrudability (02) | **Each batch** of concrete mixed. | Composite sample from mixer/pump. | Materials Operator |
| Buildability (03) | **Start of each print day**; qualification of new mix. | Printed standard test column. | M. Operator & P. Operator |
| **Hardened Properties (Cast Specimens)** |  |  |  |
| Compressive Strength (05) | 1 set per 20 m³ or **1 set per print day** (whichever is more frequent). | Set of 6 cast cylinders (2@7d, 2@28d, 2 spare). | Materials Operator |
| Flexural Strength (07) | 1 set per 40 m³ or **1 set per week** (whichever is more frequent). | Set of 3 cast beams. | Materials Operator |
| **Hardened Properties (Printed/Cored Specimens)** |  |  |  |
| Inter-Layer Bond (08) | **1 set per significant structural element** (e.g., per every 20 linear meters of wall). | Set of 3 specimens cut/cored from a test wall. | M. Operator & P. Operator |
| Cored Strength Verification | **1 set of cores per completed structure** (or as directed by engineer). | 3 cores extracted per AS 1012.14. | External Technician |
| Durability (09, 10\) | During initial mix design qualification only, unless otherwise specified. | Cored or printed specimens. | External Lab |

### **5.3. Environmental Monitoring and Control**

Environmental conditions can profoundly affect the performance of 3DCP mixes, influencing hydration rates, open time, shrinkage, and the quality of inter-layer bonds.34 Therefore, monitoring and controlling the printing environment is not optional; it is a critical quality control function.

* **Requirement:** Ambient temperature and relative humidity must be continuously monitored and logged during all printing operations and during the initial 24-hour curing period of all cast or printed specimens.  
* **Procedure:**  
  1. A calibrated digital thermo-hygrometer shall be placed in the immediate vicinity of the printing operation, shielded from direct sunlight or rain.  
  2. Temperature and humidity readings shall be recorded in the **Daily Print & Materials Log** at the start of the day and at intervals not exceeding 30 minutes during printing.  
* **Acceptable Ranges:**  
  * **Temperature:** Printing shall not commence or continue if the ambient temperature falls below 5°C or rises above 35°C, unless a specifically designed mix for such conditions has been qualified.  
  * **Relative Humidity:** The ideal range for curing is high (80-95%).34 In very low humidity (\<40%) or high wind conditions, measures such as misting or the application of an evaporation retardant may be required to prevent plastic shrinkage cracking.  
  * Any printing conducted outside these standard ranges must be noted in the log and brought to the attention of the Project Manager.

### **5.4. Roles and Responsibilities**

Clear accountability is essential for the successful implementation of this QMS. The following table outlines the primary responsibilities for quality control activities, formalizing the roles suggested by COBOD.5

**Table 3: Quality Control Responsibilities Matrix**

| Task / Protocol | Materials Operator (MO) | Printer Operator (PO) | Project Manager (PM) |
| :---- | :---- | :---- | :---- |
| **Material Management** |  |  |  |
| Incoming Material Inspection | **R** | A | I |
| Material Storage & Handling | **R** | A | I |
| **Fresh Concrete Testing** |  |  |  |
| Protocol 01: Slump Test | **R** | A | I |
| Protocol 02: Extrudability | **R** | A | I |
| Protocol 03: Buildability | **R** | A | C |
| Protocol 04: Open Time | **R** | A | C |
| **Specimen Preparation** |  |  |  |
| Casting Hardened Specimens | **R** | A | I |
| Curing of Specimens | **R** | A | I |
| **Documentation** |  |  |  |
| Daily Print & Materials Log | **R** | C | A |
| Fresh Concrete Test Record | **R** | I | A |
| Hardened Concrete Test Report | C (internal) | I | **R** (final review) |
| Non-Conformance Reporting | **R** (Initiate) | C | **A** (Approve) |
| **Overall QMS** |  |  |  |
| QMS Oversight & Compliance | C | C | **R** |
| Liaison with Engineer/Surveyor | I | I | **R** |

*Key: **R** \= Responsible (Performs the task); **A** \= Accountable (Owns the outcome); **C** \= Consulted (Provides input); **I** \= Informed (Kept up-to-date).*

## **Part 6: Documentation, Data Management, and Reporting**

If a test is not documented, it did not happen. A rigorous, auditable documentation system is the backbone of this QMS. It provides the evidence of compliance, the data for process improvement, and the traceability required for structural certification.

### **6.1. The Quality Control Record System**

A fully digital documentation system is the preferred method for all record-keeping. This system must create an unbroken, auditable trail for every component of the project. The core principle is traceability: the ability to select any point on a finished printed wall and trace its history back through a unique set of identifiers to the specific batch of concrete used, its fresh and hardened test results, the raw material certificates it was made from, and the environmental conditions at the time of printing.

### **6.2. Standardized Data Logging Templates**

To ensure consistency and completeness, the following standardized templates shall be used for all projects. These templates are designed based on the format and content of reports from NATA-accredited laboratories in Australia, ensuring they capture all information necessary for a defensible quality record.19

#### **Template 1: Daily Print & Materials Log**

* **Header:** Project Name, Project No., Date, Page \_ of \_.  
* **Personnel:** Names and roles of all operators on site (PM, MO, PO).  
* **Environmental Log:** A table with columns for Time, Ambient Temperature (°C), and Relative Humidity (%).  
* **Materials Used:** A table listing all materials used during the day, with columns for Material Type (e.g., Cement, Sand, Admixture X), Supplier, and Batch/Lot Number.

#### **Template 2: Fresh Concrete Test Record**

* **Header:** Project Name, Project No., Date.  
* **Batch Information:**  
  * Unique Batch ID (e.g., YYYYMMDD-BN\#\#)  
  * Time Batched  
  * Mix Design Code  
* **Test Results:**  
  * **Slump Test (Protocol 01):**  
    * Time of Test  
    * Measured Slump (mm)  
    * Acceptance Range (mm)  
    * Result (Pass/Fail)  
  * **Extrudability Assessment (Protocol 02):**  
    * Time of Test  
    * Visual Assessment (Pass/Fail)  
    * Vane Reading (kPa) (if applicable)  
    * Photo Reference ID  
  * **Buildability Assessment (Protocol 03\) (if applicable):**  
    * Result (Pass/Fail)  
    * Height Achieved (mm)  
* **Sign-off:** Name and Signature of Materials Operator.

#### **Template 3: Hardened Concrete Test Report**

This template is for compiling the results of hardened property tests, whether performed in-house or by an external laboratory.

* **Report Header:**  
  * Laboratory Name & Details (if external)  
  * Client & Project Details  
  * Unique Report No. & Issue No.  
  * Date of Issue  
* **Sample Details:**  
  * Unique Specimen ID(s)  
  * Traceability Link (Batch ID from Template 2\)  
  * Date Sampled / Cast  
  * Specimen Type (Cast Cylinder, Cored Cylinder, Cut Beam, etc.)  
* **Curing Details:**  
  * Initial Curing Method (ref. AS 1012.8.1)  
  * Standard Curing Method (ref. AS 1012.8.1)  
* **Test Results Table:** A table with the following columns:  
  * Specimen ID  
  * Test Age (days)  
  * Date of Test  
  * **Test Orientation (Axis 1, 2, or 3\)** \- *This is a mandatory field for all anisotropic tests.*  
  * Dimensions (mm)  
  * Density (kg/m³)  
  * Maximum Load (kN)  
  * **Strength (MPa)**  
  * Failure Mode (e.g., Normal, Shear, Cap Failure)  
  * Reference Standard (e.g., AS 1012.9)  
* **Notes Section:** A section for any remarks or deviations from standard procedure.  
* **Sign-off:** Name and Title of Approved Signatory.

### **6.3. Procedure for Non-Conformance**

A non-conformance occurs whenever any material, process, or test result falls outside the specified limits and acceptance criteria defined in this manual.

* **Trigger:** A "Fail" result on any test protocol.  
* **Procedure:**  
  1. **Immediate Action:** The operator who identifies the failure must immediately halt any further use of the non-conforming material or process. The material must be clearly labeled and quarantined.  
  2. **Notification:** The operator must immediately notify the Project Manager, providing details of the non-conformance (e.g., Batch ID, test failed, result).  
  3. **Investigation:** The Project Manager is responsible for leading an investigation into the root cause of the failure. This may involve re-testing a portion of the sample (if permissible), checking batching records, inspecting equipment, or reviewing environmental logs.  
  4. **Disposition:** Based on the investigation, the Project Manager, in consultation with the Structural Engineer if the failure is structural, will determine the disposition of the non-conforming material. Options include:  
     * **Rework:** Adjust the mix (e.g., add admixture) and re-test completely.  
     * **Reject:** Dispose of the batch in an approved manner.  
     * **Use As-Is/Concession:** Only permissible for minor, non-structural deviations with the explicit, documented approval of the Structural Engineer.  
  5. **Documentation:** A formal Non-Conformance Report (NCR) must be completed for every incident. The NCR will document the problem, the root cause analysis, the corrective action taken, and the final disposition. All NCRs form part of the final project quality dossier.

### **6.4. Final Reporting and Archiving**

* **Procedure:** At the completion of the project, or at major milestones as required, the Project Manager is responsible for compiling all quality records into a single, comprehensive Quality Assurance (QA) Dossier. This dossier will include:  
  * All Daily Print & Materials Logs.  
  * All Fresh Concrete Test Records.  
  * All Hardened Concrete Test Reports.  
  * All Non-Conformance Reports.  
  * Supplier certificates for all raw materials used.  
  * Equipment calibration records.  
* **Distribution:** This QA Dossier will be formally transmitted to the Structural Engineer and Specialist Building Surveyor for their final review, providing the objective evidence needed for structural certification and regulatory sign-off.  
* **Archiving:** A complete digital copy of the QA Dossier shall be securely archived for a minimum period of 10 years.

## **Conclusion**

This Material Testing and Quality Control Manual establishes a comprehensive and rigorous framework for ensuring the quality, safety, and durability of structures built using 3D Concrete Printing technology. By systematically integrating the established principles of Australian Standards for conventional concrete with novel, risk-based protocols tailored to the unique challenges of additive manufacturing, this document provides a clear pathway to achieving consistent and defensible outcomes.

The core principles of this manual are the explicit recognition and management of **anisotropy** and **inter-layer bond strength** as the most critical technical risks inherent in the 3DCP process. The mandated multi-axis testing of hardened properties and the introduction of a dedicated inter-layer bond strength protocol are non-negotiable requirements that elevate this QMS beyond conventional practice. Furthermore, the disciplined approach to fresh-state "printability" assessment—balancing the competing demands of pumpability, extrudability, and buildability—ensures that material quality is controlled at the earliest possible stage.

The successful implementation of this manual relies on three pillars:

1. **Procedural Discipline:** Strict adherence to the step-by-step protocols for testing, sampling, and environmental control.  
2. **Meticulous Documentation:** The creation of a complete and traceable data record for every batch of material, providing an auditable history from raw material to final structure.  
3. **Clear Accountability:** A well-defined structure of roles and responsibilities, ensuring that every member of the construction team understands their part in the quality assurance process.

By adopting this manual, we move beyond the novelty of 3D printing and embrace the engineering discipline required for its maturation into a reliable, mainstream construction method. The framework presented herein is designed not only to meet today's regulatory requirements but also to build a robust dataset that will drive future innovation, process optimization, and the continued advancement of additive construction in Australia.

#### **Works cited**

1. Concrete Testing Australian Standards: Frequency and Methods \- Core Building Inspections, accessed on July 21, 2025, [https://corebuildinginspections.com.au/concrete-testing-australian-standards-frequency-and-methods/](https://corebuildinginspections.com.au/concrete-testing-australian-standards-frequency-and-methods/)  
2. A review of concrete 3D printed structural members \- Frontiers, accessed on July 21, 2025, [https://www.frontiersin.org/journals/built-environment/articles/10.3389/fbuil.2022.1034020/full](https://www.frontiersin.org/journals/built-environment/articles/10.3389/fbuil.2022.1034020/full)  
3. (PDF) 3D concrete printing: review \- ResearchGate, accessed on July 21, 2025, [https://www.researchgate.net/publication/366060927\_3D\_concrete\_printing\_review](https://www.researchgate.net/publication/366060927_3D_concrete_printing_review)  
4. Understanding Failure and How to Avoid It: Lessons from Forensics and Predictive Analysis in AM \- 3DPrint.com | The Voice of 3D Printing / Additive Manufacturing, accessed on July 21, 2025, [https://3dprint.com/319353/understanding-failure-and-how-to-avoid-it-lessons-from-forensics-and-predictive-analysis-in-am/](https://3dprint.com/319353/understanding-failure-and-how-to-avoid-it-lessons-from-forensics-and-predictive-analysis-in-am/)  
5. FAQ | COBOD International, accessed on July 21, 2025, [https://cobod.com/faq/](https://cobod.com/faq/)  
6. The BOD2 | COBOD International, accessed on July 21, 2025, [https://cobod.com/solution/bod2/](https://cobod.com/solution/bod2/)  
7. Additive construction in practice – Realities of acceptance criteria \- ResearchGate, accessed on July 21, 2025, [https://www.researchgate.net/publication/386299857\_Additive\_construction\_in\_practice\_-\_Realities\_of\_acceptance\_criteria](https://www.researchgate.net/publication/386299857_Additive_construction_in_practice_-_Realities_of_acceptance_criteria)  
8. Australian Standard®, accessed on July 21, 2025, [https://img.antpedia.com/standard/files/pdfs\_ora/20230612/as/AS/AS%201012.2-2014.pdf?v=2.0](https://img.antpedia.com/standard/files/pdfs_ora/20230612/as/AS/AS%201012.2-2014.pdf?v=2.0)  
9. As 1012.11-2000 Methods of Testing Concrete \- Determination | PDF | Fracture \- Scribd, accessed on July 21, 2025, [https://www.scribd.com/document/343057912/As-1012-11-2000-Methods-of-Testing-Concrete-Determination](https://www.scribd.com/document/343057912/As-1012-11-2000-Methods-of-Testing-Concrete-Determination)  
10. AS 1012.9:2014 Methods of testing concrete \- NormSplash, accessed on July 21, 2025, [https://www.normsplash.com/Samples/AS/151167253/AS-1012.9-2014-en.pdf](https://www.normsplash.com/Samples/AS/151167253/AS-1012.9-2014-en.pdf)  
11. First 3D Printed Social Housing Project Built to New ISO/ASTM Standard Completed 35% Faster Than with Conventional Methods \- COBOD, accessed on July 21, 2025, [https://cobod.com/3d-printed-social-housing-project-compliant-with-new-standards/](https://cobod.com/3d-printed-social-housing-project-compliant-with-new-standards/)  
12. ICC to Set Standards for 3D Printed Walls \- 3DPrint.com, accessed on July 21, 2025, [https://3dprint.com/316359/icc-to-set-standards-for-3d-printed-walls/](https://3dprint.com/316359/icc-to-set-standards-for-3d-printed-walls/)  
13. ISO and ASTM release standard for 3D construction printing | VoxelMatters, accessed on July 21, 2025, [https://www.voxelmatters.com/iso-and-astm-release-standard-for-3d-construction-printing/](https://www.voxelmatters.com/iso-and-astm-release-standard-for-3d-construction-printing/)  
14. ISO/ASTM FDIS 52939 \- iTeh Standards, accessed on July 21, 2025, [https://cdn.standards.iteh.ai/samples/81177/18fef312b20741268027da16a5a56134/ISO-ASTM-FDIS-52939.pdf](https://cdn.standards.iteh.ai/samples/81177/18fef312b20741268027da16a5a56134/ISO-ASTM-FDIS-52939.pdf)  
15. ISO/ASTM 52939:2023 \- iTeh Standards, accessed on July 21, 2025, [https://cdn.standards.iteh.ai/samples/81177/055f55a28fad42b8ab3c3aebff82debb/ISO-ASTM-52939-2023.pdf](https://cdn.standards.iteh.ai/samples/81177/055f55a28fad42b8ab3c3aebff82debb/ISO-ASTM-52939-2023.pdf)  
16. ISO/ASTM Releases Standards for Additive Manufacturing in Construction \- 3D Printing, accessed on July 21, 2025, [https://3dprinting.com/news/iso-astm-releases-standards-for-additive-manufacturing-in-construction/](https://3dprinting.com/news/iso-astm-releases-standards-for-additive-manufacturing-in-construction/)  
17. (PDF) Standardization Aspects of Concrete 3D Printing: State of the art, requirements and first steps towards standardization \- ResearchGate, accessed on July 21, 2025, [https://www.researchgate.net/publication/389223448\_Standardization\_Aspects\_of\_Concrete\_3D\_Printing\_State\_of\_the\_art\_requirements\_and\_first\_steps\_towards\_standardization](https://www.researchgate.net/publication/389223448_Standardization_Aspects_of_Concrete_3D_Printing_State_of_the_art_requirements_and_first_steps_towards_standardization)  
18. ISO/IEC 17025 Application Document Materials \- Annex Cement testing | NATA \- Specific Accreditation Criteria, accessed on July 21, 2025, [https://nata.com.au/files/2021/05/Materials-ISO-IEC-17025-Annex-Cement-Testing.pdf](https://nata.com.au/files/2021/05/Materials-ISO-IEC-17025-Annex-Cement-Testing.pdf)  
19. Concrete Test Report (AU) \- Outback Sleepers Australia, accessed on July 21, 2025, [https://outbacksleepers.com.au/wp-content/uploads/2020/07/Lab-SA-Concrete-Test-Report-1st-June-2020.pdf](https://outbacksleepers.com.au/wp-content/uploads/2020/07/Lab-SA-Concrete-Test-Report-1st-June-2020.pdf)  
20. CONCRETE TEST REPORT \- Zenodo, accessed on July 21, 2025, [https://zenodo.org/records/15335307/files/Concrete%20Test%20Report%20Document%20%E2%80%93%20Sample%202.pdf?download=1](https://zenodo.org/records/15335307/files/Concrete%20Test%20Report%20Document%20%E2%80%93%20Sample%202.pdf?download=1)  
21. (PDF) Review of 3D Printed Concrete: Mix Design \- ResearchGate, accessed on July 21, 2025, [https://www.researchgate.net/publication/387927284\_Review\_of\_3D\_Printed\_Concrete\_Mix\_Design](https://www.researchgate.net/publication/387927284_Review_of_3D_Printed_Concrete_Mix_Design)  
22. Establishing Benchmark Properties for 3D-Printed Concrete: A Study of Printability, Strength, and Durability \- MDPI, accessed on July 21, 2025, [https://www.mdpi.com/2504-477X/9/2/74](https://www.mdpi.com/2504-477X/9/2/74)  
23. A review of 3D printed concrete: performance requirements, testing measurements and mix design \- University of Strathclyde, accessed on July 21, 2025, [https://pureportal.strath.ac.uk/en/publications/a-review-of-3d-printed-concrete-performance-requirements-testing-](https://pureportal.strath.ac.uk/en/publications/a-review-of-3d-printed-concrete-performance-requirements-testing-)  
24. 3D concrete printing \- Wikipedia, accessed on July 21, 2025, [https://en.wikipedia.org/wiki/3D\_concrete\_printing](https://en.wikipedia.org/wiki/3D_concrete_printing)  
25. SELECTING THE APPROPRIATE QUALITY CONTROL METHOD FOR 3D CONCRETE PRINTING: A FIRST GUIDELINE, accessed on July 21, 2025, [https://www.concrete.org/portals/0/files/pdf/webinars/ws\_F23\_Rehman.pdf](https://www.concrete.org/portals/0/files/pdf/webinars/ws_F23_Rehman.pdf)  
26. (PDF) Effect of Curing Methods on Shrinkage Development in 3D-Printed Concrete, accessed on July 21, 2025, [https://www.researchgate.net/publication/342045335\_Effect\_of\_Curing\_Methods\_on\_Shrinkage\_Development\_in\_3D-Printed\_Concrete](https://www.researchgate.net/publication/342045335_Effect_of_Curing_Methods_on_Shrinkage_Development_in_3D-Printed_Concrete)  
27. Buildability and Mechanical Properties of 3D Printed Concrete \- PMC, accessed on July 21, 2025, [https://pmc.ncbi.nlm.nih.gov/articles/PMC7663512/](https://pmc.ncbi.nlm.nih.gov/articles/PMC7663512/)  
28. The Effect of Printing Direction on the Strength Characteristics of a 3D Printed Concrete Wall Section \- MDPI, accessed on July 21, 2025, [https://www.mdpi.com/2075-5309/13/12/2917](https://www.mdpi.com/2075-5309/13/12/2917)  
29. 3D Concrete Printing: A Systematic Review of Rheology, Mix ..., accessed on July 21, 2025, [https://pmc.ncbi.nlm.nih.gov/articles/PMC8304820/](https://pmc.ncbi.nlm.nih.gov/articles/PMC8304820/)  
30. Development of Test Methods to Evaluate the Printability of Concrete Materials for Additive Manufacturing \- PMC, accessed on July 21, 2025, [https://pmc.ncbi.nlm.nih.gov/articles/PMC9503919/](https://pmc.ncbi.nlm.nih.gov/articles/PMC9503919/)  
31. AS 1012.1-1993 Method 1 Sampling of Fresh Concrete | PDF \- Scribd, accessed on July 21, 2025, [https://www.scribd.com/document/737821525/AS-1012-1-1993-Method-1-sampling-of-fresh-concrete](https://www.scribd.com/document/737821525/AS-1012-1-1993-Method-1-sampling-of-fresh-concrete)  
32. (PDF) Test methods for 3D printable concrete \- ResearchGate, accessed on July 21, 2025, [https://www.researchgate.net/publication/363055671\_Test\_methods\_for\_3D\_printable\_concrete](https://www.researchgate.net/publication/363055671_Test_methods_for_3D_printable_concrete)  
33. The Environment of Success: Managing Temperature and Humidity in 3D Printing and Filament Storage \- Ruuvi, accessed on July 21, 2025, [https://ruuvi.com/managing-temperature-and-humidity-in-3d-printing-and-filament-storage/](https://ruuvi.com/managing-temperature-and-humidity-in-3d-printing-and-filament-storage/)  
34. Influence of Temperature and Humidity on Mechanical Properties of Calcined Oyster-Shell Powder-Modified 3D-Printed Concrete | ACS Omega \- ACS Publications, accessed on July 21, 2025, [https://pubs.acs.org/doi/10.1021/acsomega.4c06129](https://pubs.acs.org/doi/10.1021/acsomega.4c06129)  
35. A quality control framework for digital fabrication with concrete \- RILEM Technical Letters, accessed on July 21, 2025, [https://letters.rilem.net/index.php/rilem/article/download/181/189/1961](https://letters.rilem.net/index.php/rilem/article/download/181/189/1961)  
36. A roadmap for quality control of hardening and hardened printed concrete \- Pure, accessed on July 21, 2025, [https://pure.tue.nl/ws/files/201597010/1\_s2.0\_S0008884622000916\_main.pdf](https://pure.tue.nl/ws/files/201597010/1_s2.0_S0008884622000916_main.pdf)  
37. How to Perform a Concrete Slump Test \- Deslauriers, Inc., accessed on July 21, 2025, [https://deslinc.com/blog/how-to-perform-a-concrete-slump-test](https://deslinc.com/blog/how-to-perform-a-concrete-slump-test)  
38. As1012 3 1 | PDF \- Scribd, accessed on July 21, 2025, [https://www.scribd.com/document/780050197/AS1012-3-1](https://www.scribd.com/document/780050197/AS1012-3-1)  
39. As 1012.3.1-1998 | PDF \- Scribd, accessed on July 21, 2025, [https://www.scribd.com/document/663309321/AS-1012-3-1-1998](https://www.scribd.com/document/663309321/AS-1012-3-1-1998)  
40. Concrete Slump Testing: Test Methods, Equipment, and Testing Techniques, accessed on July 21, 2025, [https://www.globalgilson.com/blog/concrete-slump-guide](https://www.globalgilson.com/blog/concrete-slump-guide)  
41. Concrete Slump Testing Background and Procedure \- Humboldt, accessed on July 21, 2025, [https://www.humboldtmfg.com/blog/concrete-slump-testing](https://www.humboldtmfg.com/blog/concrete-slump-testing)  
42. As 1012.8.1-2000 Methods of Testing Concrete \- Compression A | PDF | License \- Scribd, accessed on July 21, 2025, [https://www.scribd.com/document/343057681/As-1012-8-1-2000-Methods-of-Testing-Concrete-Compression-A](https://www.scribd.com/document/343057681/As-1012-8-1-2000-Methods-of-Testing-Concrete-Compression-A)  
43. AS 1012.10-2000 \- Standards Australia, accessed on July 21, 2025, [https://www.standards.org.au/standards-catalogue/standard-details?designation=as-1012-10-2000](https://www.standards.org.au/standards-catalogue/standard-details?designation=as-1012-10-2000)  
44. As 1012.8.2-2000 Methods of Testing Concrete \- Making and Cu ..., accessed on July 21, 2025, [https://www.scribd.com/document/343057790/As-1012-8-2-2000-Methods-of-Testing-Concrete-Making-and-Cu](https://www.scribd.com/document/343057790/As-1012-8-2-2000-Methods-of-Testing-Concrete-Making-and-Cu)  
45. Mechanical Properties of Hardened 3D Printed Concretes and Mortars—Development of a Consistent Experimental Characterization Strategy \- PMC, accessed on July 21, 2025, [https://pmc.ncbi.nlm.nih.gov/articles/PMC7914988/](https://pmc.ncbi.nlm.nih.gov/articles/PMC7914988/)  
46. AS 1012.21-1999 \- Accuris Standards Store, accessed on July 21, 2025, [https://store.accuristech.com/standards/as-1012-21-1999?product\_id=2055787](https://store.accuristech.com/standards/as-1012-21-1999?product_id=2055787)  
47. Determination of water absorption and apparent volume of permeable voids in hardened concrete \- 한국표준정보망, accessed on July 21, 2025, [https://www.kssn.net/for/detail.do?itemNo=F002013010517](https://www.kssn.net/for/detail.do?itemNo=F002013010517)  
48. As 1012.21-1999 Methods of Testing Concrete \- Permeable Voi | PDF, accessed on July 21, 2025, [https://www.scribd.com/document/343061984/As-1012-21-1999-Methods-of-Testing-Concrete-Permeable-Voi](https://www.scribd.com/document/343061984/As-1012-21-1999-Methods-of-Testing-Concrete-Permeable-Voi)  
49. Durability Testing 102: The Absorption Test \- Kryton, accessed on July 21, 2025, [https://blog.kryton.com/2024/06/durability-testing-102-the-absorption-test/](https://blog.kryton.com/2024/06/durability-testing-102-the-absorption-test/)  
50. Shrinkage behavior of cementitious 3D printing materials: Effect of temperature and relative humidity | Request PDF \- ResearchGate, accessed on July 21, 2025, [https://www.researchgate.net/publication/354699413\_Shrinkage\_behavior\_of\_cementitious\_3D\_printing\_materials\_Effect\_of\_temperature\_and\_relative\_humidity](https://www.researchgate.net/publication/354699413_Shrinkage_behavior_of_cementitious_3D_printing_materials_Effect_of_temperature_and_relative_humidity)  
51. Water absorption Test of Concrete (BS 1881 Part 122 : 2011\) \- YouTube, accessed on July 21, 2025, [https://www.youtube.com/watch?v=\_bTAfNEanzY](https://www.youtube.com/watch?v=_bTAfNEanzY)  
52. AS 1012.13-1992 Methods of testing concrete ... \- SAI Global, accessed on July 21, 2025, [https://www.saiglobal.com/PDFTemp/Previews/OSH/As/as1000/1000/101213.pdf](https://www.saiglobal.com/PDFTemp/Previews/OSH/As/as1000/1000/101213.pdf)  
53. Australian Soil and Concrete Testing (ASCT), accessed on July 21, 2025, [https://asct.com.au/construction-materials-testing/concrete-testing/](https://asct.com.au/construction-materials-testing/concrete-testing/)  
54. AS 1012.1-1993 Methods of testing concrete \- Building Code Hub, accessed on July 21, 2025, [https://codehub.building.govt.nz/assets/\_generated\_pdfs/as-1012-1-1993-11649.pdf](https://codehub.building.govt.nz/assets/_generated_pdfs/as-1012-1-1993-11649.pdf)  
55. MAKING AND CURING CONCRETE COMPRESSION AND FLEXURAL TEST SPECIMENS IN THE FIELD, accessed on July 21, 2025, [https://deldot.gov/Publications/manuals/mat\_research/pdfs/doh\_11.pdf](https://deldot.gov/Publications/manuals/mat_research/pdfs/doh_11.pdf)  
56. As 1012.14-2018 | PDF \- Scribd, accessed on July 21, 2025, [https://www.scribd.com/document/678815459/AS-1012-14-2018](https://www.scribd.com/document/678815459/AS-1012-14-2018)  
57. Everything You Should Know About Concrete Core Drilling, accessed on July 21, 2025, [https://www.capcitycutters.com/everything-you-should-know-about-concrete-core-drilling](https://www.capcitycutters.com/everything-you-should-know-about-concrete-core-drilling)  
58. Everything to Know About Concrete 3D Printing | Blog \- Constructions-3D, accessed on July 21, 2025, [https://www.constructions-3d.com/en/blog/everything-to-know-about-concrete-3-d-printing](https://www.constructions-3d.com/en/blog/everything-to-know-about-concrete-3-d-printing)  
59. Adaptive Compensation Strategy for Filament Quality Control in 3D Concrete Printing under Uncontrolled Environments, accessed on July 21, 2025, [https://ras.papercept.net/images/temp/AIM/files/0107.pdf](https://ras.papercept.net/images/temp/AIM/files/0107.pdf)  
60. Concrete Test Report Global Construction \- Zenodo, accessed on July 21, 2025, [https://zenodo.org/records/15335307/files/Concrete%20Test%20Report%20Document%20%E2%80%93%20Sample%201.pdf?download=1](https://zenodo.org/records/15335307/files/Concrete%20Test%20Report%20Document%20%E2%80%93%20Sample%201.pdf?download=1)  
61. Concrete Test Report \- Veneer Stone, accessed on July 21, 2025, [https://veneerstone.com.au/wp-content/uploads/2021/12/CON\_NEW21W\_3959-Compression.pdf](https://veneerstone.com.au/wp-content/uploads/2021/12/CON_NEW21W_3959-Compression.pdf)