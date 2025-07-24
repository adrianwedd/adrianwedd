

# **Cygnet Project: Security Audit & Management Plan**

## **1\. Executive Summary**

### **1.1 Introduction and Purpose**

This Security Audit & Management Plan establishes a comprehensive, proactive, and multi-layered security framework for all software and data systems within the Cygnet project. The primary objective is to evolve the project's security posture from its current state of basic dependency scanning to a mature, automated DevSecOps model. This plan details the procedures for regular vulnerability assessments, penetration testing, secure code reviews, and incident response. It is designed to be fundamentally compatible with autonomous agents, enabling the CODEFORGE and SENTIN-EL agents to orchestrate security operations, from threat discovery to automated remediation, ensuring the ongoing resilience and integrity of the project's digital assets.

### **1.2 Current Security Posture**

The current security measures for the Cygnet project are minimal and reactive. As the project's complexity grows, particularly with the development of public-facing dashboards and backend APIs, its exposure to cybersecurity threats increases significantly. A reactive approach is insufficient to protect against modern threats. This plan addresses this gap by instituting a formal, professional security framework designed to proactively identify and mitigate vulnerabilities before they can be exploited.

### **1.3 Summary of Recommendations**

This plan recommends a strategic shift towards a proactive and automated security paradigm. Key recommendations include:

* **Adoption of the NIST Cybersecurity Framework (CSF) 2.0:** To provide a structured, strategic foundation for all cybersecurity activities.  
* **Implementation of Integrated Security Tooling:** Deployment of specific Static Application Security Testing (SAST), Software Composition Analysis (SCA), and Dynamic Application Security Testing (DAST) tools integrated directly into the CI/CD pipeline.  
* **Scheduled Security Assessments:** Formalization of a schedule for regular, automated vulnerability scans and periodic manual penetration tests conducted by external experts.  
* **Formalized Incident Response:** Establishment of a clear, actionable Incident Response Plan (IRP) based on the SANS framework, with defined roles and playbooks for common threat scenarios.

### **1.4 Agentic Integration Overview**

The cornerstone of this plan is the deep, native integration with the Cygnet project's autonomous agents. The SENTINEL agent will be tasked with continuous monitoring, threat detection, and the initiation of automated scanning and incident response workflows. The CODEFORGE agent will be responsible for interacting with the codebase, analyzing SAST/SCA results, and orchestrating automated remediation tasks, such as generating fix pull requests. This agent-centric model is designed to reduce manual overhead, accelerate response times, and embed security seamlessly into the development lifecycle.

## **2\. Security Governance and Framework**

### **2.1 Adoption of the NIST Cybersecurity Framework (CSF) 2.0**

To provide a robust and industry-recognized foundation for managing cybersecurity risk, the Cygnet project will adopt the National Institute of Standards and Technology (NIST) Cybersecurity Framework (CSF) 2.0.1 The NIST CSF is a voluntary framework that consists of standards, guidelines, and best practices to manage cybersecurity-related risk.2 Its outcome-oriented and non-prescriptive nature makes it exceptionally well-suited for an agent-driven security model, as it allows for flexible implementation of controls through automation. The framework provides a common language and a structured approach that is understandable to both technical and non-technical stakeholders.1

The CSF is organized around six core, concurrent functions that provide a complete lifecycle for managing cybersecurity risk. The GOVERN function is central, informing how the other five functions are implemented.1

* **GOVERN (GV):** Establish and monitor the organization's cybersecurity risk management strategy, expectations, and policy. This is a new and critical function in CSF 2.0 that will be used to establish the policies, roles, and risk strategy detailed in this plan.  
* **IDENTIFY (ID):** Develop an organizational understanding to manage cybersecurity risk to systems, assets, data, and capabilities.  
* **PROTECT (PR):** Develop and implement appropriate safeguards to ensure the delivery of critical services.  
* **DETECT (DE):** Develop and implement appropriate activities to identify the occurrence of a cybersecurity event.  
* **RESPOND (RS):** Develop and implement appropriate activities to take action regarding a detected cybersecurity incident.  
* **RECOVER (RC):** Develop and implement appropriate activities to maintain plans for resilience and to restore any capabilities or services that were impaired due to a cybersecurity incident.

This structure provides a direct and traceable line from high-level policy to automated execution. For example, a task for the SENTINEL agent can be mapped directly to a CSF subcategory, such as fulfilling ID.AM-01 (Hardware inventories maintained) and ID.AM-02 (Software, services, and systems inventories maintained) by programmatically querying cloud provider APIs and comparing the results against a known asset database.1

### **2.2 Roles and Responsibilities (GV.RR)**

Clear roles and responsibilities are essential for an effective security program. The following roles are mapped to key stakeholders within the Cygnet project, in alignment with the NIST CSF GV.RR category.1

* **Project Manager:**  
  * **Responsibilities:** Holds overall ownership of this Security Plan, makes final decisions on risk acceptance, and is responsible for allocating the budget for security tools and services.  
  * **NIST CSF Alignment:** GV.RR-01 (Organizational leadership is accountable for cybersecurity risk), GV.RR-03 (Adequate resources are allocated).  
* **CODEFORGE / Lead Developer:**  
  * **Responsibilities:** Implements secure coding practices, remediates application-level vulnerabilities identified by SAST/DAST scans, and oversees the integration and maintenance of SAST tools within the CI/CD pipeline.  
  * **NIST CSF Alignment:** PR.PS-06 (Secure software development practices are integrated).  
* **DevOps/Infrastructure Manager:**  
  * **Responsibilities:** Implements and manages infrastructure-level security controls, configures and maintains DAST and other scanning tools, and manages the security posture of all cloud environments.  
  * **NIST CSF Alignment:** PR.IR-01 (Networks and environments are protected from unauthorized logical access), PR.PS-01 (Configuration management practices are established).  
* **SENTINEL Agent (Automated):**  
  * **Responsibilities:** Acts as the primary automated entity for security monitoring and detection. It will trigger scheduled and ad-hoc DAST scans, monitor logs for anomalous activity, and initiate the incident response process by creating incident tasks.  
  * **NIST CSF Alignment:** DE.CM (Continuous Monitoring), DE.AE (Adverse Event Analysis).  
* **CODEFORGE Agent (Automated):**  
  * **Responsibilities:** Acts as the primary automated entity for code-level security and remediation. It will interact with SAST scan results from the CI/CD pipeline, create detailed remediation tasks for developers, and, where possible, generate automated pull requests to fix identified vulnerabilities.  
  * **NIST CSF Alignment:** PR.PS-06 (Secure software development practices are integrated and monitored).

### **2.3 Risk Management Strategy (GV.RM)**

A formal risk management strategy will be implemented to ensure that security efforts are prioritized effectively. This process is aligned with the NIST CSF categories GV.RM (Risk Management Strategy) and ID.RA (Risk Assessment).1

The strategy involves:

1. **Risk Identification:** Continuously identifying vulnerabilities and threats through the processes defined in this plan (DAST, SAST, penetration testing).  
2. **Risk Analysis:** Evaluating each identified vulnerability based on its technical severity and potential business impact.  
3. **Risk Prioritization:** Using a formal prioritization matrix (detailed in Section 5.2) to rank vulnerabilities, ensuring that the most critical issues are addressed first.  
4. **Risk Response:** Defining a clear action for each risk: Remediate, Mitigate, Accept, or Transfer.  
5. **Risk Monitoring:** Continuously monitoring the status of identified risks and the effectiveness of implemented controls.

The project's risk appetite will be formally documented, establishing the level of risk that is deemed acceptable in pursuit of its objectives. This will guide all risk-based decision-making.

## **3\. Proactive Threat Discovery and Management**

### **3.1 Vulnerability Assessment (Dynamic Application Security Testing \- DAST)**

DAST, or black-box testing, involves testing an application from the outside in, simulating how an attacker would probe for vulnerabilities without knowledge of the internal source code. This is a critical practice for identifying runtime vulnerabilities in the project's web applications and APIs.

#### **3.1.1 Procedure**

* **Scope (ID.AM):** The scope of DAST scans will include all public-facing and authenticated endpoints of the Cygnet dashboard, backend APIs, and any associated web services deployed in staging and production environments.1  
* **Frequency:** Automated DAST scans will be conducted **weekly** against the staging environment. Additionally, a full DAST scan is **mandatory** as a quality gate before any major feature or component is released to production.

#### **3.1.2 Tooling Evaluation and Recommendation**

A comparative analysis of leading DAST tools was conducted to select the most appropriate solution for the Cygnet project. The primary criteria were scanning efficacy, cost, and, most critically, the maturity and accessibility of its API for agent-based automation.

| Feature | OWASP ZAP | Nessus Professional |
| :---- | :---- | :---- |
| **Core Functionality** | Comprehensive DAST for web apps and APIs; includes active/passive scanning, spidering, and fuzzing.5 | Primarily a network vulnerability scanner with strong web application scanning capabilities.5 |
| **Cost** | Free and open-source.6 | Commercial license. Starts at approximately $4,708.20 USD per year for a single user.7 |
| **API Maturity** | Excellent. A comprehensive, well-documented REST API designed for full automation of all core features.9 | Available. Primarily focused on managing scans and retrieving reports.12 Less granular control compared to ZAP. |
| **CI/CD Integration** | High. Can be run via Docker containers and controlled via API, making it ideal for pipeline integration.15 | Good. Integrates with major CI/CD tools, often through plugins. |
| **Extensibility** | High. A rich marketplace of free, community-developed add-ons allows for extensive customization.6 | Moderate. Extensible through plugins, but primarily vendor-driven. |
| **Support** | Community-based via forums and documentation.17 | Commercial support available with subscription.7 |
| **Recommendation** | **Recommended.** The combination of zero cost, a powerful automation-first API, and high extensibility makes it the ideal choice for the agent-driven framework of the Cygnet project. | Not Recommended. While a powerful tool, the commercial cost and less granular API make it a less optimal fit for the project's specific automation requirements. |

**Recommendation:** **OWASP ZAP** is the recommended DAST tool for the Cygnet project. Its robust, automation-centric API is perfectly suited for integration with the SENTINEL agent, and its open-source, extensible nature aligns with the project's technical ethos.

#### **3.1.3 Agentic Integration (SENTINEL)**

The SENTINEL agent will be responsible for the complete lifecycle of automated DAST scans.

1. **Triggering Scans:** On a scheduled basis or upon a pre-release trigger, SENTINEL will initiate a scan via the ZAP API. It will first start the ZAP spider to discover all accessible URLs and then launch the active scanner.  
   * **Example API Call (Python):**  
     Python  
     import zapv2

     zap \= zapv2.ZAPv2(apikey='\<ZAP\_API\_KEY\>', proxies={'http': 'http://127.0.0.1:8080', 'https': 'http://127.0.0.1:8080'})  
     target\_url \= 'https://cygnet-staging.example.com'

     \# Start Spider  
     scan\_id \= zap.spider.scan(target\_url)  
     \#... wait for spider to complete...

     \# Start Active Scan  
     ascan\_id \= zap.ascan.scan(target\_url)

     18  
2. **Monitoring Status:** The agent will periodically poll the ZAP API to check the status of the active scan until it reaches 100% completion.10  
   * **Example API Call (Python):**  
     Python  
     while int(zap.ascan.status(ascan\_id)) \< 100:  
         time.sleep(60)

     19  
3. **Ingesting Results:** Upon completion, SENTINEL will retrieve the full scan report in a machine-readable JSON format.  
   * **Example API Call (Python):**  
     Python  
     report\_json \= zap.core.jsonreport()

     (Derived from htmlreport and xmlreport methods 19)  
4. **Task Creation:** The agent will parse the JSON report. For each vulnerability found with a severity of "Medium" or higher, it will create a new task in the /tasks/todo/ directory using the dast-vulnerability.yml schema (see Appendix B). The task will be populated with all relevant details, including the alert type, URL, parameter, evidence, and recommended solution.

### **3.2 Penetration Testing**

While automated scanners are effective at finding common vulnerabilities, a manual penetration test conducted by a skilled security expert is necessary to uncover complex business logic flaws, chained exploits, and other subtle issues.

#### **3.2.1 Methodology**

The project will adopt a **Grey Box** testing methodology.21 In this approach, the external testers are provided with limited information, such as user-level credentials for the dashboard. This simulates a realistic attack scenario where an adversary has already compromised a low-level user account and is attempting to escalate privileges or access unauthorized data. It provides a more efficient and targeted assessment than a pure Black Box test while remaining more realistic than a full White Box test.21

#### **3.2.2 Engagement, Frequency, and Budget**

* **Engagement:** The project will engage an external, CREST-certified penetration testing firm based in Australia to ensure a high standard of quality and professionalism.22  
* **Frequency:** A full penetration test is **mandatory** prior to the first major public release of the Cygnet dashboard and APIs. Subsequently, a test will be conducted **annually** or following any significant changes to the application's architecture or authentication mechanisms.  
* **Budget:** Based on Australian market rates for a project of this scope (web application and associated APIs), the estimated cost for a single penetration testing engagement ranges from AUD $15,000 to $25,000.24 A budget within this range should be allocated.

#### **3.2.3 Agentic Integration**

* **Scheduling and Procurement:** The SENTINEL agent will maintain the penetration testing schedule. Sixty days prior to a scheduled test, it will automatically create a task for the Project Manager, initiating the vendor engagement and procurement process.  
* **Results Ingestion:** Following the test, the final PDF report will be manually uploaded to a secure, designated project repository. A webhook or file system trigger will notify the SENTINEL agent, which will then use a document parsing module to extract key findings (vulnerability title, severity, location, recommendation). For each high or critical severity finding, the agent will create a high-priority remediation task in the /tasks/todo/ directory, assigning it to the Lead Developer.

### **3.3 Secure Code Review and Static Analysis (SAST)**

Secure code review is a foundational practice for identifying vulnerabilities directly within the source code, enabling them to be fixed before the application is ever deployed. This will be accomplished through a combination of manual process improvements and automated tooling.

#### **3.3.1 Manual Review Process**

A mandatory security checklist will be integrated into the project's pull request (PR) template. All developers must review their code against this checklist before submitting a PR. The checklist will be derived from the **OWASP Secure Coding Practices Quick Reference Guide** and will prompt reviewers to explicitly check for common flaws in areas such as:

* **Input Validation:** Ensuring all data from external sources is validated and sanitized.26  
* **Authentication and Authorization:** Verifying that access controls are correctly implemented and enforced.26  
* **Error Handling and Logging:** Confirming that error messages do not leak sensitive information and that security-relevant events are logged.26  
* **Database Security:** Checking for the use of parameterized queries to prevent SQL injection.26

#### **3.3.2 Tooling Evaluation and Recommendation (SAST/SCA)**

The selection of an automated SAST and Software Composition Analysis (SCA) tool is critical for integrating security into the CI/CD pipeline. The evaluation focused on accuracy, developer experience, and API capabilities for agent integration. A key consideration is the ability of a single tool to provide a unified scan for both custom code vulnerabilities (SAST) and vulnerabilities in third-party dependencies (SCA), which simplifies the automation workflow for the CODEFORGE agent.

| Feature | Snyk | SonarQube | GitHub CodeQL |
| :---- | :---- | :---- | :---- |
| **Primary Focus** | Developer-first security (SAST & SCA).28 | Overall code quality, including security.29 | Semantic code analysis for security.28 |
| **Unified SAST/SCA** | Yes, core feature. Scans both in a single operation.28 | Primarily SAST; SCA capabilities are present but less of a core focus. | Primarily SAST. Dependency scanning is a separate feature in GitHub Advanced Security. |
| **Developer Experience** | Excellent. Integrates directly into IDEs and PRs with clear, actionable feedback and automated fix suggestions.30 | Moderate. Can be noisy, often flags issues as "hotspots" requiring manual triage.31 | Good. Deep integration with GitHub, but writing custom queries has a steep learning curve.28 |
| **Automated Remediation** | Excellent. Can automatically generate pull requests to upgrade vulnerable dependencies.30 | No. Identifies issues but does not automate fixes. | No. Identifies issues but does not automate fixes. |
| **API Capabilities** | Excellent. Comprehensive REST API for managing projects, retrieving issues, and automation.34 | Good. REST API is available but more focused on reporting metrics and managing quality gates.37 | Available via the standard GitHub API, but less specific to security workflow automation. |
| **Pricing Model** | Free tier available. Paid plans are per-developer, starting around $25/user/month.40 | Free open-source Community Edition. Paid tiers are based on lines of code, starting at \~$160/year.42 | Free for open-source projects. Included with GitHub Enterprise for private repositories. |
| **Recommendation** | **Recommended.** The unified SAST/SCA, superior developer experience, and robust API for automated remediation make it the ideal choice for the Cygnet project's agentic and DevSecOps goals. | Not Recommended. The focus on code quality over pure security and the lack of automated remediation are significant drawbacks for this project's needs. | Not Recommended. While powerful, its effectiveness can depend on custom query development, and it lacks the unified SCA and automated fix features of Snyk. |

**Recommendation:** **Snyk** is the recommended SAST/SCA tool. Its developer-first approach, unified scanning engine, and powerful API for automating remediation align perfectly with the project's goal of embedding security seamlessly into the development workflow and enabling the CODEFORGE agent.

#### **3.3.3 CI/CD Integration**

Snyk will be integrated directly into the GitHub Actions workflow. A new workflow file, .github/workflows/snyk-scan.yml, will be created to trigger a Snyk scan on every pull request targeting the main or develop branches. The job will be configured to fail if any new high-severity vulnerabilities are introduced.

* **Example GitHub Actions Workflow:**  
  YAML  
  name: Snyk Security Scan  
  on:  
    pull\_request:  
      branches: \[ main, develop \]  
  jobs:  
    snyk:  
      runs-on: ubuntu-latest  
      steps:  
        \- uses: actions/checkout@v4  
        \- name: Run Snyk to check for vulnerabilities  
          uses: snyk/actions/python@master  
          env:  
            SNYK\_TOKEN: ${{ secrets.SNYK\_TOKEN }}  
          with:  
            command: monitor  
            args: \--fail-on=high

  33

#### **3.3.4 Agentic Integration (CODEFORGE)**

The CODEFORGE agent will automate the triage and remediation process for findings from Snyk.

1. **Automated Task Creation:** When a Snyk scan in the CI/CD pipeline fails, a webhook will trigger the CODEFORGE agent. The agent will then query the Snyk API to retrieve the detailed results for that specific project and PR.  
   * **API Endpoint:** POST /org/{orgId}/project/{projectId}/aggregated-issues.45  
2. **Task Generation:** For each new high-severity vulnerability, the agent will create a new, high-priority task in the /tasks/todo/ directory using the sast-vulnerability.yml schema (see Appendix B). The task will be automatically assigned to the author of the pull request and will include the vulnerability details, the affected file path and line number, and a link to the Snyk report.  
3. **Automated Remediation:** For dependency vulnerabilities where Snyk provides a clear upgrade path, the CODEFORGE agent can be tasked to initiate an automated fix. It will use the Snyk CLI or API to generate a new pull request containing the recommended dependency upgrade.30 The agent will then post a comment in the original PR, linking to the new "fix" PR for the developer to review and merge.

## **4\. Incident Response and Recovery**

### **4.1 The Incident Response Plan (IRP) \- SANS Framework**

A formal Incident Response Plan (IRP) is critical for ensuring a swift, coordinated, and effective response to security incidents, minimizing potential damage, downtime, and reputational harm. The Cygnet project will adopt the widely respected **SANS 6-Step Incident Response Process** as its official framework.46

* **Step 1: Preparation:** This foundational phase involves establishing the necessary resources before an incident occurs.  
  * **Incident Response Team (IRT):** A formal IRT will be designated, with clear roles (e.g., Incident Commander, Communications Lead, Technical Lead) assigned to project stakeholders.  
  * **Tools and Resources:** Ensure access to essential tools, including centralized logging platforms, network traffic analysis tools, and secure, out-of-band communication channels (e.g., a dedicated Signal or Slack channel).  
  * **Training:** The IRT will conduct annual tabletop exercises simulating various threat scenarios to ensure readiness.46  
* **Step 2: Identification:** This phase involves detecting and confirming that a security incident has occurred.  
  * **Incident Triggers:** An incident can be identified through automated alerts from security tools (Snyk, ZAP, cloud monitoring), manual reports from users or developers, or external notifications.  
  * **Initial Analysis:** The on-call IRT member will perform an initial analysis to validate the alert, determine its scope, and classify its severity.47  
* **Step 3: Containment:** The immediate goal of this phase is to limit the impact of the incident and prevent further damage.  
  * **Short-Term Containment:** Isolate affected systems from the network (e.g., by modifying security group rules), disable compromised user accounts, or block malicious IP addresses at the firewall or WAF.  
  * **Long-Term Containment:** Apply temporary fixes to eradicate the immediate threat while a more permanent solution is developed.46  
* **Step 4: Eradication:** This phase focuses on removing the root cause of the incident from the environment.  
  * **Root Cause Analysis:** The IRT will conduct a thorough investigation to identify the vulnerability or misconfiguration that was exploited.  
  * **Removal:** This may involve patching software, removing malware, resetting all compromised credentials, and hardening affected systems.47  
* **Step 5: Recovery:** This phase involves restoring affected systems and services to normal operation safely.  
  * **Restoration:** Systems will be restored from known-good backups.  
  * **Validation:** Restored systems must be thoroughly tested and monitored to ensure they are clean and fully functional before being brought back into the production environment.46  
* **Step 6: Lessons Learned:** This is the most critical phase for continuous improvement.  
  * **Post-Incident Review:** A mandatory post-mortem meeting will be held within 14 days of the incident's resolution.  
  * **Report:** A report will be generated detailing the incident timeline, the actions taken, the effectiveness of the response, and recommendations for improving security controls and the IRP itself.47

### **4.2. Incident Response Playbooks**

To ensure rapid and consistent responses to common threats, the following specific playbooks will be developed and maintained:

* **Playbook 1: Critical Vulnerability Discovered (e.g., Log4Shell):**  
  * **Identification:** High-severity alert from Snyk.  
  * **Containment:** If a patch is not immediately available, implement WAF rules to block exploit patterns.  
  * **Eradication:** Prioritize and deploy the patched dependency across all affected services.  
  * **Recovery:** Verify successful deployment and monitor for any signs of compromise.  
  * **Lessons Learned:** Review patch management and dependency update processes.  
* **Playbook 2: Web Application Defacement:**  
  * **Identification:** Alert from uptime/content monitoring tool or public report.  
  * **Containment:** Immediately take the affected application offline and replace it with a static maintenance page.  
  * **Eradication:** Identify the exploited vulnerability (e.g., file upload flaw), patch the code, and restore the application's content from the last known-good backup.  
  * **Recovery:** Bring the clean application back online and closely monitor logs.  
  * **Lessons Learned:** Analyze the root cause and improve relevant security controls (e.g., input validation, file permissions).  
* **Playbook 3: Suspected Data Breach:**  
  * **Identification:** Alert from database activity monitoring or anomalous API usage patterns.  
  * **Containment:** Isolate the affected database server, rotate all database credentials, and revoke compromised API keys.  
  * **Eradication:** Conduct a forensic analysis of logs to determine the scope of the breach and patch the root cause vulnerability.  
  * **Recovery:** Restore data integrity from backups if necessary. Follow the communications plan for notifying affected parties and regulatory bodies.48  
  * **Lessons Learned:** Review data access controls, logging, and monitoring policies.

### **4.3 Agentic Role in Incident Response**

The SENTINEL agent will play a crucial role in automating the initial stages of incident response, accelerating detection and triage.

* **Automated Identification:** SENTINEL will be configured with rules to monitor logs and security tool alerts for high-confidence Indicators of Compromise (IoCs). For example, a rule could be: "If N failed login attempts from IP X are followed by a successful login within T minutes, and IP X is on a known threat intelligence feed, trigger a 'Brute Force' incident."  
* **Automated Tasking:** Upon triggering an incident, SENTINEL will immediately:  
  1. Create a master incident task in the /tasks/incident/ directory using the incident-master.yml schema (see Appendix B).  
  2. Tag the on-call members of the Incident Response Team in the task.  
  3. Post a high-priority alert to the secure communication channel, including a summary of the event, the affected asset, and a link to the master incident task.  
* **Automated Containment (Human-in-the-Loop):** For a limited set of pre-defined and low-impact scenarios, SENTINEL can propose a containment action for human approval. For example, in the brute force scenario above, the agent's alert could include interactive buttons: "Suspicious login from IP 1.2.3.4. Propose blocking at firewall? \[Approve\] \`\`". This allows the on-call responder to take immediate action from their mobile device without needing to log into a console, drastically reducing containment time.

## **5\. Reporting, Remediation, and Continuous Improvement**

### **5.1 Vulnerability Management Lifecycle**

To ensure that all identified vulnerabilities are tracked, prioritized, and remediated in a timely manner, a formal lifecycle process will be established. Every finding will be managed as a task within the Cygnet system and will progress through the following states:

1. **Discovered:** The vulnerability has been identified by a security tool or assessment and a task has been automatically created by an agent.  
2. **Analyzed:** A human has reviewed the finding to validate its authenticity and assess its business impact.  
3. **Acknowledged:** The finding has been assigned to a developer or team for remediation.  
4. **Remediating:** A fix for the vulnerability is actively being developed.  
5. **Verifying:** A fix has been committed and deployed to a staging environment, and is awaiting a re-scan or QA to confirm the vulnerability is resolved.  
6. **Closed:** The fix has been verified and the vulnerability is confirmed to be remediated.

Service Level Agreements (SLAs) for remediation will be enforced based on the final risk score of the vulnerability:

* **Critical:** Remediation must begin within 24 hours; must be closed within 7 days.  
* **High:** Must be closed within 30 days.  
* **Medium:** Must be closed within 90 days.  
* **Low:** Must be closed within 180 days or accepted as a known risk.

### **5.2 Prioritization Matrix**

Not all vulnerabilities are created equal. To focus remediation efforts on the issues that pose the greatest threat to the project, a risk-based prioritization matrix will be used. This approach moves beyond relying solely on the technical severity of a vulnerability and incorporates its business context.

The risk score will be calculated as follows:  
RiskScore=(CVSSBaseScore)×(BusinessImpactScore)

* **CVSS Base Score:** The industry-standard Common Vulnerability Scoring System score (0.1-10.0) provided by the scanning tool.  
* **Business Impact Score:** A score from 1 to 5 assigned during the "Analyzed" phase, based on the potential impact of the vulnerability on the confidentiality, integrity, and availability (CIA) of the affected system or data.

This calculated Risk Score will be the primary metric used to prioritize the remediation backlog.

### **5.3 Agentic Role in Remediation Tracking**

The agentic framework is uniquely positioned to automate the administrative overhead of vulnerability management, creating a closed-loop system that tracks a finding from discovery to closure.

* **Task Status Updates:** The CODEFORGE and SENTINEL agents will be responsible for updating the status of the tasks they create.  
* **Commit Monitoring:** When a developer pushes a commit with a message that references a task ID (e.g., git commit \-m "Fix \#TASK-123: Sanitize user input to prevent XSS"), a webhook will trigger the CODEFORGE agent. The agent will parse the message and automatically transition the status of TASK-123 from Acknowledged to Remediating.  
* **Automated Verification:** Once the pull request containing the fix is merged into the staging branch, the CODEFORGE agent will automatically trigger a targeted re-scan of the specific vulnerability.  
  * For a SAST finding, it will trigger a Snyk scan on the affected code.  
  * For a DAST finding, it will trigger a ZAP scan against the specific endpoint and parameter.  
* **Automated Closure/Re-opening:** If the re-scan confirms the fix, the agent will transition the task to the Verifying state and assign it to a QA team member for final approval. If the re-scan fails, the agent will transition the task back to Acknowledged, add a comment with the failure details, and re-assign it to the original developer.

This automated, closed-loop process ensures that vulnerabilities are not only reported but are actively tracked, verified, and closed, significantly improving the project's overall security hygiene and reducing the "reporting gap" where known issues languish in a backlog.

| Task ID | Description | Responsible Agent | Trigger | Key API Interaction(s) | Output/Artifact |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **DAST-01** | Initiate Weekly DAST Scan | SENTINEL | Scheduled (Weekly) | ZAP API: ascan.scan(), core.jsonreport() | New tasks in /tasks/todo/ |
| **DAST-02** | Initiate Pre-Release DAST Scan | SENTINEL | Manual task trigger | ZAP API: ascan.scan(), core.jsonreport() | PR check status (Pass/Fail), New tasks |
| **SAST-01** | Scan Pull Request | CODEFORGE | GitHub Action (on PR) | Snyk CLI: snyk test \--fail-on=high | PR check status (Pass/Fail) |
| **SAST-02** | Create SAST Remediation Task | CODEFORGE | Webhook from failed SAST-01 job | Snyk API: project/.../aggregated-issues | New task in /tasks/todo/ |
| **SAST-03** | Initiate Automated Dependency Fix | CODEFORGE | Manual task trigger or specific alert | Snyk API/CLI: snyk fix | New Pull Request with dependency upgrade |
| **PENTEST-01** | Schedule Penetration Test | SENTINEL | Scheduled (Annual, \-60 days) | Project Task System API | New task for Project Manager |
| **IR-01** | Declare New Incident | SENTINEL | Log monitoring alert threshold breach | Project Task System API | New task in /tasks/incident/, Alert in chat |
| **REM-01** | Track Remediation Progress | CODEFORGE | Git commit webhook | Git API, Project Task System API | Task status updated to 'Remediating' |
| **REM-02** | Verify Fix and Close Task | CODEFORGE | Merge to staging branch | Snyk/ZAP API (re-scan), Task System API | Task status updated to 'Verifying' or 'Acknowledged' |

## **Appendix A: Tooling Configuration and API Reference**

### **OWASP ZAP**

* **Configuration:** ZAP should be run in daemon mode using the official Docker image. The API key must be generated and stored as a secure secret accessible by the SENTINEL agent. A new context should be configured for the Cygnet application, defining the scope of the scans and any authentication parameters required for testing authenticated endpoints.  
* **Key API Endpoints:**  
  * POST /json/ascan/action/scan/: Initiates an active scan against a specified target URL.  
  * GET /json/ascan/view/status/: Checks the progress of an ongoing active scan.  
  * GET /json/core/view/alerts/: Retrieves a summary of alerts found for a given target.  
  * GET /OTHER/core/other/jsonreport/: Generates a detailed report of all findings in JSON format.  
  * POST /json/spider/action/scan/: Initiates the spider to discover application URLs.

    9

### **Snyk**

* **Configuration:** A Snyk API token with appropriate permissions must be generated and stored as a GitHub repository secret (SNYK\_TOKEN). The Cygnet repository will be imported as a Project within a Snyk Organization. The snyk-api-import tool can be used for bulk management of projects if needed.50  
* **Key API Endpoints:**  
  * GET /orgs: Lists all organizations the authenticated user has access to.  
  * GET /org/{orgId}/projects: Lists all projects within a specific organization.  
  * POST /org/{orgId}/project/{projectId}/aggregated-issues: Retrieves a detailed list of all issues (vulnerabilities and license) for a specific project, with filtering capabilities.45  
  * PUT /org/{orgId}/project/{projectId}: Updates project settings, such as the branch to monitor.  
  * (Via CLI) snyk fix: Automatically applies recommended fixes for vulnerable dependencies.33

## **Appendix B: Agent Task Schemas**

The following YAML schemas define the structure for tasks created automatically by the SENTINEL and CODEFORGE agents. This standardized, machine-readable format ensures consistency and provides all necessary information for developers and the incident response team.

### **dast-vulnerability.yml**

YAML

\# Schema for a vulnerability discovered by a DAST scan (e.g., OWASP ZAP)  
apiVersion: cygnet.dev/v1  
kind: SecurityTask  
metadata:  
  source: SENTINEL  
  type: DAST  
spec:  
  title: "DAST Finding: \[Vulnerability Name\]"  
  severity: \[Critical, High, Medium, Low\]  
  status: Discovered  
  cweId: "CWE-..."  
  vulnerabilityDetails:  
    name: "Cross-site Scripting (Reflected)"  
    url: "https://cygnet-staging.example.com/dashboard"  
    parameter: "search\_query"  
    attackVector: "'\\"\>\<script\>alert(1)\</script\>"  
    evidence: "HTTP response included the injected script tag."  
  remediation:  
    recommendation: "Sanitize and apply context-aware output encoding to the 'search\_query' parameter before rendering it in the HTML response."  
    reference: "https://owasp.org/www-community/attacks/xss/"

### **sast-vulnerability.yml**

YAML

\# Schema for a vulnerability discovered by a SAST/SCA scan (e.g., Snyk)  
apiVersion: cygnet.dev/v1  
kind: SecurityTask  
metadata:  
  source: CODEFORGE  
  type:  
spec:  
  title: " Finding: \[Vulnerability Name\]"  
  severity: \[Critical, High, Medium, Low\]  
  status: Discovered  
  snykId: "SNYK-PYTHON-REQUESTS-12345"  
  cweId: "CWE-..."  
  vulnerabilityDetails:  
    name: "SQL Injection"  
    package: "requests@2.25.0" \# For SCA  
    filePath: "/src/api/database.py"  
    line: 42  
    codeSnippet: "cursor.execute(f\\"SELECT \* FROM users WHERE id \= '{user\_id}'\\")"  
  remediation:  
    recommendation: "Use parameterized queries or an ORM to prevent SQL injection. Do not use f-strings to construct SQL queries with user-controlled input."  
    reference: "https://snyk.io/vuln/SNYK-PYTHON-REQUESTS-12345"

### **incident-master.yml**

YAML

\# Schema for a master incident tracking task  
apiVersion: cygnet.dev/v1  
kind: IncidentTask  
metadata:  
  source: SENTINEL  
  incidentId: "INC-2025-001"  
spec:  
  title: "Incident INC-2025-001: Suspected Brute Force Attack on Login API"  
  status: Identification  
  severity: High  
  summary: "Detected 150 failed login attempts from IP 1.2.3.4 against /api/login, followed by a successful login for user 'admin'."  
  timeline:  
    \- timestamp: "2025-07-22T14:30:00Z"  
      event: "Alert triggered by log monitoring rule."  
    \- timestamp: "2025-07-22T14:30:01Z"  
      event: "Incident task created by SENTINEL."  
  team:  
    incidentCommander: "@project-manager"  
    communicationsLead: "@project-manager"  
    technicalLead: "@lead-developer"  
  linkedTasks:  
    \- "TASK-456: Investigate anomalous login activity"  
    \- "TASK-457: Block malicious IP at firewall"

#### **Works cited**

1. The NIST Cybersecurity Framework (CSF) 2.0 \- NIST Technical ..., accessed on July 22, 2025, [https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf)  
2. Understanding the NIST cybersecurity framework \- Federal Trade Commission, accessed on July 22, 2025, [https://www.ftc.gov/business-guidance/small-businesses/cybersecurity/nist-framework](https://www.ftc.gov/business-guidance/small-businesses/cybersecurity/nist-framework)  
3. How to Implement the NIST Cybersecurity Framework | Step-by-Step Guide \- Netwrix, accessed on July 22, 2025, [https://www.netwrix.com/guide-to-implementing-nist-csf.html](https://www.netwrix.com/guide-to-implementing-nist-csf.html)  
4. NIST Cybersecurity Framework: Policy Template Guide \- CIS Center for Internet Security, accessed on July 22, 2025, [https://www.cisecurity.org/-/media/project/cisecurity/cisecurity/data/media/files/uploads/2024/08/cis-ms-isac-nist-cybersecurity-framework-policy-template-guide-2024.pdf](https://www.cisecurity.org/-/media/project/cisecurity/cisecurity/data/media/files/uploads/2024/08/cis-ms-isac-nist-cybersecurity-framework-policy-template-guide-2024.pdf)  
5. Compare Nessus vs. OWASP ZAP vs. Swascan in 2025 \- Slashdot, accessed on July 22, 2025, [https://slashdot.org/software/comparison/Nessus-vs-OWASP-Zed-Attack-Proxy-ZAP-vs-Swascan/](https://slashdot.org/software/comparison/Nessus-vs-OWASP-Zed-Attack-Proxy-ZAP-vs-Swascan/)  
6. Compare Crashtest Security vs. Nessus vs. OWASP ZAP in 2025 \- Slashdot, accessed on July 22, 2025, [https://slashdot.org/software/comparison/Crashtest-Security-vs-Nessus-vs-OWASP-Zed-Attack-Proxy-ZAP/](https://slashdot.org/software/comparison/Crashtest-Security-vs-Nessus-vs-OWASP-Zed-Attack-Proxy-ZAP/)  
7. Tenable Nessus Pricing 2025 \- TrustRadius, accessed on July 22, 2025, [https://www.trustradius.com/products/tenable-nessus/pricing](https://www.trustradius.com/products/tenable-nessus/pricing)  
8. Tenable.io Pricing \- SaaSworthy, accessed on July 22, 2025, [https://www.saasworthy.com/product/tenable-io/pricing](https://www.saasworthy.com/product/tenable-io/pricing)  
9. zap-api-docs/source/includes/welcome.md at main \- GitHub, accessed on July 22, 2025, [https://github.com/zaproxy/zap-api-docs/blob/master/source/includes/welcome.md](https://github.com/zaproxy/zap-api-docs/blob/master/source/includes/welcome.md)  
10. OWASP ZAP API \- PublicAPI, accessed on July 22, 2025, [https://publicapi.dev/owasp-zap-api](https://publicapi.dev/owasp-zap-api)  
11. API Reference \- Zed Attack Proxy (ZAP), accessed on July 22, 2025, [https://www.zaproxy.org/docs/api/](https://www.zaproxy.org/docs/api/)  
12. Nessus API \- Developer docs, APIs, SDKs, and auth. | API Tracker, accessed on July 22, 2025, [https://apitracker.io/a/nessus](https://apitracker.io/a/nessus)  
13. Navigate the APIs \- Tenable Developer Portal, accessed on July 22, 2025, [https://developer.tenable.com/reference/navigate](https://developer.tenable.com/reference/navigate)  
14. Tenable Vulnerability Management API, accessed on July 22, 2025, [https://developer.tenable.com/docs/welcome](https://developer.tenable.com/docs/welcome)  
15. ZAP Action Full Scan \- GitHub Marketplace, accessed on July 22, 2025, [https://github.com/marketplace/actions/zap-full-scan](https://github.com/marketplace/actions/zap-full-scan)  
16. Strengthening Your Web Application Security: Integrating OWASP ZAP with GitHub Actions, accessed on July 22, 2025, [https://systemweakness.com/strengthening-your-web-application-security-integrating-owasp-zap-with-github-actions-2c177545f21d](https://systemweakness.com/strengthening-your-web-application-security-integrating-owasp-zap-with-github-actions-2c177545f21d)  
17. Documentation \- ZAP, accessed on July 22, 2025, [https://www.zaproxy.org/docs/](https://www.zaproxy.org/docs/)  
18. OWASP ZAP Python API sample script \- Security Automation with Ansible 2 \[Book\], accessed on July 22, 2025, [https://www.oreilly.com/library/view/security-automation-with/9781788394512/a5a05b03-1598-4eeb-9567-60ea66645873.xhtml](https://www.oreilly.com/library/view/security-automation-with/9781788394512/a5a05b03-1598-4eeb-9567-60ea66645873.xhtml)  
19. Automated Security Testing Using ZAP Python API, accessed on July 22, 2025, [https://www.ministryoftesting.com/articles/automated-security-testing-using-zap-python-api](https://www.ministryoftesting.com/articles/automated-security-testing-using-zap-python-api)  
20. How to Run an OWASP ZAP Vulnerability Scan Online Without Local Installation \- Funkyton, accessed on July 22, 2025, [https://funkyton.com/zap-owasp-web-scan/](https://funkyton.com/zap-owasp-web-scan/)  
21. Types of Penetration Testing: Black Box, White Box & Grey Box \- Redscan, accessed on July 22, 2025, [https://www.redscan.com/news/types-of-pen-testing-white-box-black-box-and-everything-in-between/](https://www.redscan.com/news/types-of-pen-testing-white-box-black-box-and-everything-in-between/)  
22. Penetration Testing \- StickmanCyber, accessed on July 22, 2025, [https://www.stickmancyber.com/proactive-cybersecurity-penetration-testing](https://www.stickmancyber.com/proactive-cybersecurity-penetration-testing)  
23. Penetration Testing Service Providers in Australia \- Astra Security, accessed on July 22, 2025, [https://www.getastra.com/pentest-services/australia](https://www.getastra.com/pentest-services/australia)  
24. What's the Real Cost of Skipping Penetration Testing for Your Australian Business?, accessed on July 22, 2025, [https://www.coresentinel.com/the-real-cost-of-skipping-penetration-testing/](https://www.coresentinel.com/the-real-cost-of-skipping-penetration-testing/)  
25. How much does a Penetration Testing cost on Average? \- Astra Security, accessed on July 22, 2025, [https://www.getastra.com/blog/security-audit/penetration-testing-cost/](https://www.getastra.com/blog/security-audit/penetration-testing-cost/)  
26. Secure Coding Practices Checklist \- OWASP Foundation, accessed on July 22, 2025, [https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/stable-en/02-checklist/05-checklist](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/stable-en/02-checklist/05-checklist)  
27. 10-point secure code review checklist for developers \- HackTheBox, accessed on July 22, 2025, [https://www.hackthebox.com/blog/secure-code-reviews](https://www.hackthebox.com/blog/secure-code-reviews)  
28. Compare CodeQL vs. Snyk vs. SonarQube Server in 2025 \- Slashdot, accessed on July 22, 2025, [https://slashdot.org/software/comparison/CodeQL-vs-Snyk-vs-SonarQube/](https://slashdot.org/software/comparison/CodeQL-vs-Snyk-vs-SonarQube/)  
29. snyk vs. sonarqube vs. dependabot vs. checkmarx vs. veracode vs. github advanced security \- Ritza Articles, accessed on July 22, 2025, [https://ritza.co/articles/gen-articles/snyk-vs-sonarqube-vs-dependabot-vs-checkmarx-vs-veracode-vs-github-advanced-security/](https://ritza.co/articles/gen-articles/snyk-vs-sonarqube-vs-dependabot-vs-checkmarx-vs-veracode-vs-github-advanced-security/)  
30. Automating remediation for vulnerabilities in Python dependencies using Snyk, accessed on July 22, 2025, [https://snyk.io/blog/automating-remediation-for-vulnerabilities-in-python-dependencies-using-snyk/](https://snyk.io/blog/automating-remediation-for-vulnerabilities-in-python-dependencies-using-snyk/)  
31. DryRun Security vs. Semgrep, SonarQube, CodeQL and Snyk – C\# Security Analysis Showdown, accessed on July 22, 2025, [https://www.dryrun.security/blog/dryrun-security-vs-semgrep-sonarqube-codeql-and-snyk---c-security-analysis-showdown](https://www.dryrun.security/blog/dryrun-security-vs-semgrep-sonarqube-codeql-and-snyk---c-security-analysis-showdown)  
32. DryRun Security vs. Snyk, CodeQL, SonarQube, and Semgrep – Python (Django) Security Analysis Showdown, accessed on July 22, 2025, [https://www.dryrun.security/blog/dryrun-security-vs-snyk-codeql-sonarqube-and-semgrep---python-django-security-analysis-showdown](https://www.dryrun.security/blog/dryrun-security-vs-snyk-codeql-sonarqube-and-semgrep---python-django-security-analysis-showdown)  
33. Snyk fix: Automatic vulnerability remediation from the Snyk CLI, accessed on July 22, 2025, [https://snyk.io/blog/snyk-fix-automatic-vulnerability-remediation-snyk-cli/](https://snyk.io/blog/snyk-fix-automatic-vulnerability-remediation-snyk-cli/)  
34. Snyk API | Documentation | Postman API Network, accessed on July 22, 2025, [https://www.postman.com/api-evangelist/snyk/documentation/mppgu5u/snyk-api](https://www.postman.com/api-evangelist/snyk/documentation/mppgu5u/snyk-api)  
35. user-docs/docs/snyk-api/rest-api/about-the-rest-api.md at main \- GitHub, accessed on July 22, 2025, [https://github.com/snyk/user-docs/blob/main/docs/snyk-api/rest-api/about-the-rest-api.md](https://github.com/snyk/user-docs/blob/main/docs/snyk-api/rest-api/about-the-rest-api.md)  
36. Snyk REST API Documentation, accessed on July 22, 2025, [https://apidocs.snyk.io/](https://apidocs.snyk.io/)  
37. Web API \- SonarQube Docs, accessed on July 22, 2025, [https://docs.sonarsource.com/sonarqube-server/9.8/extension-guide/web-api/](https://docs.sonarsource.com/sonarqube-server/9.8/extension-guide/web-api/)  
38. Web API \- SonarQube Docs, accessed on July 22, 2025, [https://docs.sonarsource.com/sonarqube-server/10.5/extension-guide/web-api/](https://docs.sonarsource.com/sonarqube-server/10.5/extension-guide/web-api/)  
39. SonarQube Server Web API | Documentation \- SonarQube Docs, accessed on July 22, 2025, [https://docs.sonarsource.com/sonarqube-server/latest/extension-guide/web-api/](https://docs.sonarsource.com/sonarqube-server/latest/extension-guide/web-api/)  
40. Snyk Pricing: Cost and Pricing plans \- SaaSworthy, accessed on July 22, 2025, [https://www.saasworthy.com/product/snyk-io/pricing](https://www.saasworthy.com/product/snyk-io/pricing)  
41. Snyk Pricing: Plans, Features, and How to Get the Best Deal \- Spendflo, accessed on July 22, 2025, [https://www.spendflo.com/blog/snyk-pricing-plans-features](https://www.spendflo.com/blog/snyk-pricing-plans-features)  
42. SonarQube Server Pricing 2025 \- TrustRadius, accessed on July 22, 2025, [https://www.trustradius.com/products/sonarqube/pricing](https://www.trustradius.com/products/sonarqube/pricing)  
43. Plans & Pricing SonarQube Server and SonarQube Cloud Developer Tools | Sonar, accessed on July 22, 2025, [https://www.sonarsource.com/plans-and-pricing/](https://www.sonarsource.com/plans-and-pricing/)  
44. Getting Started with SAST: Detecting Vulnerabilities Early with GitHub Actions \- Medium, accessed on July 22, 2025, [https://medium.com/@yoshiyuki.watanabe/getting-started-with-sast-detecting-vulnerabilities-early-with-github-actions-57ecd54e8ccb](https://medium.com/@yoshiyuki.watanabe/getting-started-with-sast-detecting-vulnerabilities-early-with-github-actions-57ecd54e8ccb)  
45. Using the Snyk API to find and fix vulnerabilities, accessed on July 22, 2025, [https://snyk.io/blog/using-the-snyk-api-to-find-and-fix-vulnerabilities/](https://snyk.io/blog/using-the-snyk-api-to-find-and-fix-vulnerabilities/)  
46. SANS Incident Response: 6-Step Process & Critical Best Practices | Exabeam, accessed on July 22, 2025, [https://www.exabeam.com/explainers/incident-response/sans-incident-response-6-step-process-critical-best-practices/](https://www.exabeam.com/explainers/incident-response/sans-incident-response-6-step-process-critical-best-practices/)  
47. Incident Response | SANS Institute, accessed on July 22, 2025, [https://www.sans.org/security-resources/glossary-of-terms/incident-response/](https://www.sans.org/security-resources/glossary-of-terms/incident-response/)  
48. 7 Best Incident Response Plan Templates for Security Teams \- Wiz, accessed on July 22, 2025, [https://www.wiz.io/academy/example-incident-response-plan-templates](https://www.wiz.io/academy/example-incident-response-plan-templates)  
49. Top 8 Incident Response Plan Templates \- Cynet, accessed on July 22, 2025, [https://www.cynet.com/incident-response/incident-response-plan-template/](https://www.cynet.com/incident-response/incident-response-plan-template/)  
50. Tool: snyk-api-import \- GitHub, accessed on July 22, 2025, [https://github.com/snyk/user-docs/blob/main/docs/scan-with-snyk/snyk-tools/tool-snyk-api-import/README.md](https://github.com/snyk/user-docs/blob/main/docs/scan-with-snyk/snyk-tools/tool-snyk-api-import/README.md)