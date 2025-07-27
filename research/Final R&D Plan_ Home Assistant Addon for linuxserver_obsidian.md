

# **Research and Development Plan: A Home Assistant Addon for linuxserver/obsidian**

## **Introduction: Architecting a Professional Home Assistant Addon**

This document presents a comprehensive research and development plan for the creation of a secure, stable, and seamlessly integrated Home Assistant addon for Obsidian. The primary objective is to wrap the official linuxserver/obsidian Docker image, making the powerful note-taking application a first-class citizen within the Home Assistant ecosystem. This plan moves beyond a simple proof-of-concept to architect a professional-grade addon suitable for widespread community use.

The development process will be guided by a set of core architectural principles designed to maximize stability, usability, and long-term maintainability. These pillars ensure that the final product is not only functional but also robust, secure, and easy for both end-users and the developer to manage.

### **Architectural Pillars**

* **The "Pure Wrapper" Philosophy:** The foundational strategy of this project is to avoid reinventing the wheel. Instead of attempting to build and maintain a complex Docker image containing Obsidian and its dependencies from scratch, this addon will function as a "pure wrapper." It will leverage the image key within the addon's configuration file to instruct the Home Assistant Supervisor to pull and run the official, pre-built linuxserver/obsidian image directly.1 This approach confers several significant advantages: it drastically simplifies the development and build process, offloads the complex maintenance of the core application to the expert LinuxServer.io team, and guarantees that users of the addon will benefit from the same regular and timely application updates provided to the broader Docker community.3  
* **Ingress-First User Experience:** For a graphical user interface (GUI) application like Obsidian, which is delivered via the KasmVNC web interface in the linuxserver/obsidian image, a seamless user experience is paramount. Therefore, Home Assistant's Ingress feature will be treated as a core, non-negotiable requirement. Ingress allows the addon's web UI to be embedded directly within the Home Assistant interface, inheriting its authentication and secure remote access capabilities.4 This eliminates the need for users to manually configure port forwarding, manage separate logins, or expose additional services to the internet, resulting in a more professional, secure, and user-friendly product.6  
* **Configuration as Code:** All user-configurable parameters will be managed declaratively through the addon's config.yaml file. This file will feature a robust and clearly defined schema, which enables Home Assistant to automatically generate a user-friendly configuration panel in the UI.1 This approach provides users with input validation, clear descriptions for each option, and a consistent configuration experience, while ensuring the addon receives predictable and correctly formatted data.1  
* **Automation-Driven Quality:** A commitment to modern software development practices is essential for a high-quality product. This plan incorporates a fully automated Continuous Integration and Continuous Deployment (CI/CD) pipeline using GitHub Actions. This pipeline will be responsible for automatically linting code against best practices, running validation checks, and managing the release process. This automation ensures high-quality, repeatable builds and significantly reduces the potential for human error.

## **Phase 1: Foundational Analysis and Environment Setup**

Before any code is written, a thorough analysis of the project's components is required. This phase is dedicated to deconstructing the target Docker image to understand its operational needs and establishing a professional, repeatable development workflow that will serve as the foundation for the entire project.

### **1.1. Deconstruction of the linuxserver/obsidian Docker Image**

The first step is to fully understand the behavior and requirements of the linuxserver/obsidian Docker image. This analysis will directly inform the entire addon configuration, ensuring that all necessary parameters are correctly exposed and managed.

The linuxserver/obsidian container is based on the Docker Baseimage KasmVNC.7 This is a critical piece of information, as it reveals that the image provides a full Linux desktop environment, including the Obsidian application, which is then streamed to the user's web browser. This KasmVNC foundation is what makes the Ingress-first approach the ideal method for integration.

A detailed review of the official Docker Hub page and the LinuxServer.io documentation reveals several core and advanced operational parameters that the addon must accommodate.

* **Core Parameters:**  
  * **User and Group Mapping:** The environment variables PUID (Process User ID) and PGID (Process Group ID) are standard across LinuxServer.io images. They are used to set the user and group that the application runs as inside the container. This is essential for ensuring correct file ownership and permissions on the persistent data volume.7  
  * **Timezone:** The TZ environment variable allows the user to specify their timezone (e.g., America/New\_York), ensuring that timestamps and other time-sensitive operations within the application are accurate.7  
  * **Networking:** The image exposes two primary ports: 3000/tcp for the standard HTTP-based KasmVNC web GUI and 3001/tcp for an HTTPS-based GUI. For the purposes of this addon, only the HTTP port is relevant, as Ingress will handle the secure connection.  
  * **Persistent Storage:** The image designates the /config directory inside the container as its volume for persistent data. This path is used to store all application settings, user preferences, and, most importantly, the user's Obsidian vaults.  
* **Advanced Parameters and Special Flags:**  
  * **Authentication:** The image provides optional basic HTTP authentication via the CUSTOM\_USER and PASSWORD environment variables.7 These should be treated as advanced options and defaulted to empty strings. Home Assistant's Ingress provides its own robust single sign-on (SSO), making these variables redundant for most users.  
  * **Hardware Acceleration:** For systems with a compatible GPU, performance can be significantly improved by passing through the host's DRI (Direct Rendering Infrastructure) device.3 The addon will enable this capability statically via the  
    video: true key in config.yaml, which is the simplest and most robust method for granting GPU access.5  
  * **Shared Memory:** The documentation explicitly notes that the \--shm-size flag is necessary for Electron-based applications like Obsidian to function correctly. This flag increases the size of the shared memory (/dev/shm) available to the container.  
  * **Security Context:** For some modern GUI applications, the \--security-opt seccomp=unconfined flag may be required. This flag cannot be set directly in config.yaml. If the image requires forbidden system calls, the addon must request elevated permissions via full\_access: true or a specific entry in the privileged list.5 This reduces container isolation and must be clearly documented as a security consideration.

The following table summarizes this analysis, translating the raw Docker parameters into actionable requirements that will guide the addon's implementation.

| Parameter Type | Name | Description & Source | Addon Implementation Notes |
| :---- | :---- | :---- | :---- |
| Environment | PUID / PGID | User/Group ID for file permissions on persistent storage.7 | Expose as puid and pgid integer options in config.yaml. |
| Environment | TZ | Timezone string (e.g., Europe/London) to set the container's time.7 | Expose as a tz string option in config.yaml. |
| Environment | CUSTOM\_USER | Optional username for the image's built-in basic HTTP authentication.7 | Expose as an optional username string. Default to empty; document as an advanced option as Ingress provides SSO. |
| Environment | PASSWORD | Optional password for the image's built-in basic HTTP authentication.7 | Expose as an optional password secret. Default to empty; document as an advanced option. |
| Port | 3000/tcp | The internal port for the KasmVNC Web UI (HTTP). | This port will be the target for Ingress. It should not be exposed directly on the host. |
| Volume | /config | The internal path for persistent storage of all settings and user vaults. | This path must be mapped to the addon's persistent storage directory (/data). |
| Runtime Flag | \--shm-size | Specifies a larger shared memory size, required for Electron apps. | Handled by the Supervisor. The modern tmpfs: true option in config.yaml can be used.5 |
| Runtime Flag | \--device /dev/dri | Passes through the host GPU for hardware acceleration.3 | Enable via video: true in config.yaml.5 |
| Runtime Flag | \--security-opt | seccomp=unconfined, sometimes needed for GUI apps. | Requires full\_access: true or privileged list in config.yaml. Carries security risks.5 |

### **1.2. Structuring the Addon Repository**

A clean, standardized, and maintainable project structure is a hallmark of professional software development. This project will adhere to the community-standard structure defined by the official home-assistant/addons-example repository. This ensures consistency with the broader Home Assistant ecosystem and makes the project easier for other developers to understand and contribute to.8

The repository will be organized as follows:

* **obsidian/ (The Addon Directory):** This directory will contain all files specific to the Obsidian addon.  
  * config.yaml: The addon manifest.  
  * run.sh: The execution script.  
  * icon.png & logo.png: Branding assets (128x128px and \~250x100px respectively).6  
  * README.md, DOCS.md, CHANGELOG.md: Essential documentation.  
  * translations/en.yaml: A stub file for UI translations, a requirement for submission to community repositories.5  
* **repository.yaml:** The repository manifest. This file must be placed at the root of the Git repository. Its presence is what allows the Home Assistant Supervisor to recognize the repository as a valid source of addons.  
* **.github/:** This directory will house all CI/CD automation workflows.

Notably, a Dockerfile is absent. Because this project follows the "pure wrapper" philosophy, the Supervisor will not build a local image.

### **1.3. Configuring the Development Environment**

To ensure an efficient and realistic testing environment, this plan mandates the use of the official Visual Studio Code Devcontainer setup for Home Assistant addon development.10

The setup process is straightforward and well-documented:10

1. **Prerequisites:** Install Docker Desktop, Visual Studio Code, and the official "Dev Containers" extension.  
2. **Configuration Files:** Create a .devcontainer/devcontainer.json file and a .vscode/tasks.json file in the repository root.  
3. **Launch:** Open the repository folder in VS Code and select "Reopen in Container."  
4. **Bootstrap:** Run the "Start Home Assistant" task from the VS Code command palette. The fresh Home Assistant instance will then be accessible at http://localhost:8123, with the Obsidian addon ready for testing.10

## **Phase 2: Core Addon Implementation (config.yaml)**

This phase focuses on the meticulous construction of the addon's central manifest, config.yaml. This file is the heart of the addon, defining its identity, user-facing configuration, and deep integration with the Home Assistant Supervisor.

### **2.1. Essential Metadata**

The first step is to give the addon a clear and professional identity.5

* name: "Obsidian"  
* version: "1.0.0"  
* slug: "obsidian"  
* description: "A secure, self-hosted digital brain with Home Assistant integration."  
* url: A link to the addon's GitHub repository.  
* arch: \[aarch64, amd64, armv7\].  
* init: false: This crucial setting is mandatory. As the addon's run.sh will call the upstream exec /init, this prevents the s6 supervisor from running twice and ensures stability.5

### **2.2. The Wrapper Strategy: The image Key**

To implement the "pure wrapper" philosophy, the image key is used.5

The implementation will be: image: "lscr.io/linuxserver/obsidian:{version}".

* **Multi-Architecture Manifests:** The linuxserver/obsidian image uses multi-arch manifests, meaning a single image tag (e.g., lscr.io/linuxserver/obsidian:latest) contains layers for all supported architectures.7 The Supervisor will automatically pull the correct one, so the  
  {arch} placeholder is not required in the image string.  
* **Version and Tag Coupling:** It is a mandatory requirement that the value of the addon's version key must exactly match the Docker image tag specified in the image key.5 The Supervisor will refuse to install or update the addon if these diverge.  
* **Automated Updates:** Manually tracking upstream image updates is inefficient. A superior strategy is to use a dependency management tool like Renovate. It can be configured to monitor the container registry for new tags and automatically open a pull request that bumps both the image tag and the corresponding version in config.yaml, streamlining the update process.

### **2.3. User Configuration: options and schema**

To provide a seamless user experience, the required environment variables are exposed as validated options in the Home Assistant UI using the options and schema keys.5

* **User/Group and Timezone:**  
  YAML  
  options:  
    puid: 1000  
    pgid: 1000  
    tz: ""  
  schema:  
    puid: int  
    pgid: int  
    tz: str

* **Advanced Authentication (Optional):** The password? schema type makes the field optional and instructs the UI to treat it as a secret, masking its value.5  
  YAML  
  options:  
    username: ""  
    password: ""  
  schema:  
    username: str?  
    password: password?

### **2.4. Seamless Integration and Resource Management**

This section defines the addon's integration with Home Assistant's core features.

* **Ingress:** The Ingress feature embeds the Obsidian web UI directly and securely into the Home Assistant frontend.6  
  YAML  
  ingress: true  
  ingress\_port: 3000  
  panel\_icon: mdi:notebook-edit  
  panel\_title: Obsidian  
  ports: {}

* **Health and Resource Management:** To improve stability, a healthcheck and resource hints are added.5  
  YAML  
  watchdog: 'http://:3000/healthz'  
  memory: 512

* **Snapshot Friendliness:** To prevent large browser caches from bloating user backups, the backup\_exclude key is used.5  
  YAML  
  backup\_exclude:  
    \- 'cache/'  
    \- 'BrowserCache/'  
    \- '.cache/'

### **2.5. Persistent Storage: map**

Ensuring that all user data persists is non-negotiable. The data mapping is one of several predefined mount types managed by the Supervisor.5

The config.yaml will contain map: \[data:rw\]. This makes the addon's managed persistent storage directory available at the /data path inside the container. The path mismatch with the upstream image's expectation of /config will be resolved in the run.sh script.

### **2.6. System Privileges and Security**

An addon should be granted only the minimum privileges necessary.

* **GPU Access:** To enable hardware acceleration, the addon needs access to the host's rendering device. The simplest method is with video: true in config.yaml.5 This statically enables GPU access; it is not a user-configurable toggle.  
* **Shared Memory:** The requirement for an increased shared memory size is best handled with the modern tmpfs: true key in config.yaml, which mounts /tmp as a RAM disk.5

## **Phase 3: Execution Logic and Container Definition**

This phase covers the implementation of the run.sh script, which serves as the intelligent entrypoint for the addon.

### **3.1. The run.sh Execution Script**

The run.sh script connects the user's configuration to the runtime environment of the linuxserver/obsidian container.1

The script's logic will be executed in a specific sequence:

1. **Shebang and Bashio:** The script must begin with \#\!/usr/bin/with-contenv bashio to make the bashio helper library available.12  
2. **Configuration Parsing:** The script will use bashio::config to read user options and export them as the environment variables expected by the linuxserver/obsidian image.12  
3. **Handle Path Mismatch:** This robust logic handles the creation of the symbolic link.  
   Bash  
   \# Symlink /data to /config to match linuxserver.io's expected data path.  
   \# This handles cases where /config doesn't exist, or where it was pre-created  
   \# as a directory by the base image.  
   if \[\! \-e /config \]; then  
       bashio::log.info "Creating symbolic link from /data to /config..."  
       ln \-s /data /config  
   elif \[ \-d /config \] && \[\! \-L /config \]; then  
       bashio::log.warning "/config exists as a directory, removing and re-linking to /data."  
       rm \-rf /config  
       ln \-s /data /config  
   fi

4. **Execution Handoff:** The final and most critical line of the script is exec /init.  
   Bash  
   \# Hand off to the upstream s6-overlay init process.  
   \# NOTE: This effectively starts s6 twice (once by Supervisor, once here).  
   \# This is expected, but requires \`init: false\` in config.yaml to prevent conflicts.  
   exec /init

### **3.2. The Dockerfile Wrapper**

In a "pure wrapper" addon that uses the image key in config.yaml, the Home Assistant Supervisor **ignores the Dockerfile entirely**.5 Therefore, a

Dockerfile is **not required and should be omitted**.

## **Phase 4: Quality Assurance, Automation, and Publishing**

The final phase establishes the professional framework for testing, maintaining, and distributing the addon.

### **4.1. Testing Protocols**

* **Local Testing (via Devcontainer):** The primary development loop will take place within the VS Code devcontainer.10 After any change, the developer can restart the addon from the devcontainer's Home Assistant UI (at  
  http://localhost:8123) and immediately inspect the logs.  
* **Remote Testing (on Real Hardware):** Before any official release, the addon must be tested on a physical device running a standard Home Assistant installation to catch architecture-specific or hardware-related bugs.10

### **4.2. Automation with GitHub Actions**

* **Linting Workflow:** A workflow will be created using the community-standard frenck/action-addon-linter. It will run on every push and pull\_request to validate addon files against Home Assistant's schema and best practices.  
* **Release Workflow:** A second workflow will automate the process of creating official releases, triggered by a Git tag (e.g., v\*).

### **4.3. Publishing the Addon**

* **The repository.yaml File:** This file must exist at the root of the GitHub repository.  
  YAML  
  name: "Obsidian Home Assistant Addon"  
  url: "https://github.com/your-username/your-repo-name"  
  maintainer: "Your Name \<your-email@example.com\>"

* **User Installation Instructions:** The project's main README.md file must include a clear, step-by-step guide for users to add the repository to their Home Assistant instance.

## **Conclusion and Future Development**

This revised research and development plan outlines a professional methodology for creating a Home Assistant addon for linuxserver/obsidian. By adhering to the corrected and refined architectural pillars, the resulting addon will be stable, secure, and easy to maintain.

Upon successful implementation of this plan, the addon will provide a seamless and powerful way for Home Assistant users to integrate Obsidian into their smart home ecosystem. The initial release will be a fully-featured product, with several clear avenues for future enhancement to achieve a polished 1.0 GA release.

### **Recommendations for Future Enhancements**

* **Translation Readiness:** Create a stub translations/en.yaml file early in the development process. This is a prerequisite for submission to most community addon repositories and allows for future localization of configuration option names and descriptions.5  
* **Code Signing:** For enhanced security and to meet the requirements of official community repositories, pre-add the codenotary key to config.yaml (e.g., codenotary: "\[email protected\]"). This makes enabling container image signing with CodeNotary a straightforward final step before a major release.5  
* **Automated Release Notes:** Configure the Renovate bot not only to update the image version but also to include upstream changelog snippets in the body of its pull requests. This provides instant, context-rich release notes for the developer and end-users.

#### **Works cited**

1. Publishing your add-on | Home Assistant Developer Docs, accessed on June 22, 2025, [https://developers.home-assistant.io/docs/add-ons/publishing/](https://developers.home-assistant.io/docs/add-ons/publishing/)  
2. addons/git\_pull/data/run.sh at master · home-assistant/addons \- GitHub, accessed on June 22, 2025, [https://github.com/home-assistant/hassio-addons/blob/master/git\_pull/data/run.sh](https://github.com/home-assistant/hassio-addons/blob/master/git_pull/data/run.sh)  
3. Your own Home Assistant add-on \- Dev notes, accessed on June 22, 2025, [https://blog.michal.pawlik.dev/posts/smarthome/home-assistant-addons/](https://blog.michal.pawlik.dev/posts/smarthome/home-assistant-addons/)  
4. Introducing Hass.io Ingress \- Home Assistant, accessed on June 22, 2025, [https://www.home-assistant.io/blog/2019/04/15/hassio-ingress/](https://www.home-assistant.io/blog/2019/04/15/hassio-ingress/)  
5. Presenting your addon | Home Assistant Developer Docs, accessed on June 22, 2025, [https://developers.home-assistant.io/docs/add-ons/presentation/](https://developers.home-assistant.io/docs/add-ons/presentation/)  
6. linuxserver/obsidian Tags \- Docker Hub, accessed on June 22, 2025, [https://hub.docker.com/r/linuxserver/obsidian/tags](https://hub.docker.com/r/linuxserver/obsidian/tags)  
7. obsidian \- LinuxServer.io, accessed on June 22, 2025, [https://docs.linuxserver.io/images/docker-obsidian/](https://docs.linuxserver.io/images/docker-obsidian/)  
8. 3\. Home Assistant Addon — SunFounder Pironman documentation, accessed on June 22, 2025, [https://docs.sunfounder.com/projects/pironman-u1/en/latest/home\_assistant/ha\_addon.html](https://docs.sunfounder.com/projects/pironman-u1/en/latest/home_assistant/ha_addon.html)  
9. Add-on configuration | Home Assistant Developer Docs, accessed on June 22, 2025, [https://developers.home-assistant.io/docs/add-ons/configuration/](https://developers.home-assistant.io/docs/add-ons/configuration/)  
10. config.yaml \- home-assistant/addons \- GitHub, accessed on June 22, 2025, [https://github.com/home-assistant/addons/blob/master/openwakeword/config.yaml](https://github.com/home-assistant/addons/blob/master/openwakeword/config.yaml)  
11. Activity · grafana/home-assistant-addons \- GitHub, accessed on June 22, 2025, [https://github.com/grafana/home-assistant-addons/activity](https://github.com/grafana/home-assistant-addons/activity)  
12. linuxserver/obsidian \- Docker Image, accessed on June 22, 2025, [https://hub.docker.com/r/linuxserver/obsidian](https://hub.docker.com/r/linuxserver/obsidian)  
13. home-assistant-addon/music\_assistant\_beta/config.yaml at main \- GitHub, accessed on June 22, 2025, [https://github.com/music-assistant/home-assistant-addon/blob/main/music\_assistant\_beta/config.yaml](https://github.com/music-assistant/home-assistant-addon/blob/main/music_assistant_beta/config.yaml)