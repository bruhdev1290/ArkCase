# ArkCase Netlify Deployment

This directory contains a feature-rich static web application for ArkCase that can be deployed to Netlify. It includes an interactive demo dashboard, documentation, and landing page.

## 🌟 Features

This Netlify deployment includes:

### Landing Page (`index.html`)
- Overview of ArkCase features and capabilities
- Architecture information
- Getting started guide
- Links to resources

### Interactive Demo (`demo/`)
- **Dashboard** - Statistics, recent cases, tasks, activity timeline
- **Cases** - Case listing with filters, create new case modal
- **Tasks** - Kanban-style task board with drag-and-drop UI
- **Documents** - File browser with folder tree
- **Reports** - Report generation options
- **Search** - Advanced search with filters

### Documentation (`docs/`)
- Getting started guide
- Installation instructions
- Core concepts (Cases, Tasks, Documents, Workflows)
- Architecture overview
- API reference
- Authentication methods

## ⚠️ Important Limitations

**ArkCase is a full Java enterprise application** that cannot run entirely on Netlify. The full application requires:

- **Java Application Server**: Apache Tomcat 9
- **Database**: MySQL, PostgreSQL, MariaDB, or SQL Server
- **Search Engine**: Apache Solr
- **Content Management**: Alfresco
- **Messaging**: Apache ActiveMQ
- **Reporting**: Pentaho
- **Workflow Engine**: Activiti BPM

This Netlify deployment provides a **static demonstration** of the ArkCase UI and features. Data is not persisted and backend integrations are simulated.

## Directory Structure

```
netlify-site/
├── index.html          # Landing page
├── css/
│   ├── style.css       # Main styles
│   ├── demo.css        # Demo dashboard styles
│   └── docs.css        # Documentation styles
├── js/
│   └── demo.js         # Demo interactivity
├── demo/
│   └── index.html      # Interactive demo dashboard
├── docs/
│   └── index.html      # Documentation
└── README.md           # This file
```

## Deploying to Netlify

### Option 1: Deploy via Netlify UI

1. Go to [Netlify](https://www.netlify.com/)
2. Click "Add new site" > "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Publish directory**: `netlify-site`
   - **Build command**: (leave empty for static site)
5. Click "Deploy"

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from the repository root
netlify deploy --prod --dir=netlify-site
```

### Option 3: Drag and Drop

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag the `netlify-site` folder to the upload area

## Full ArkCase Deployment

For full ArkCase functionality, you need to deploy on a proper infrastructure:

### Quick Start with Pre-built VM

Download a pre-built ArkCase virtual machine:
https://github.com/ArkCase/arkcase-ce

### Developer Setup

1. **Prerequisites**:
   - 16 GB RAM minimum
   - 50 GB disk space
   - Java 8 (AdoptOpenJDK)
   - Maven 3.5+
   - Node.js
   - Yarn

2. **Build from source**:
   ```bash
   git clone https://github.com/ArkCase/ArkCase.git
   cd ArkCase
   mvn -DskipITs clean install
   ```

3. **Setup backend services** following the instructions in the main [README.md](../README.md)

## Customizing the Landing Page

To customize the landing page:

1. Edit `netlify-site/index.html` for content changes
2. Edit `netlify-site/css/style.css` for styling changes
3. Add images to `netlify-site/images/`

## Alternative: Frontend-Only Deployment

If you want to deploy just the AngularJS frontend (requires a backend API to function):

1. Navigate to frontend directory:
   ```bash
   cd acm-standard-applications/arkcase/src/main/webapp/resources
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Build for production:
   ```bash
   NODE_ENV=production grunt
   ```

4. The built assets will be in `assets/dist/`

Note: The frontend will not function without the Java backend API.

## Resources

- [ArkCase Website](https://www.arkcase.com)
- [ArkCase Architecture](https://www.arkcase.com/developer-support/architecture/)
- [ArkCase GitHub](https://github.com/ArkCase/ArkCase)
- [ArkCase CE (Community Edition)](https://github.com/ArkCase/arkcase-ce)

## License

ArkCase is licensed under the GNU Lesser General Public License (LGPL).
