# ArkCase Netlify Deployment

This directory contains a static demo/landing page for ArkCase that can be deployed to Netlify.

## ⚠️ Important Limitations

**ArkCase is a full Java enterprise application** that cannot run entirely on Netlify. Netlify is designed for static websites and JAMstack applications, while ArkCase requires:

- **Java Application Server**: Apache Tomcat 9
- **Database**: MySQL, PostgreSQL, MariaDB, or SQL Server
- **Search Engine**: Apache Solr
- **Content Management**: Alfresco
- **Messaging**: Apache ActiveMQ
- **Reporting**: Pentaho
- **Workflow Engine**: Activiti BPM

This Netlify deployment provides only a **static demo/landing page** to showcase ArkCase features and direct users to the proper deployment methods.

## What This Deployment Includes

- `index.html` - Static landing page with ArkCase information
- `css/style.css` - Styling for the landing page
- `netlify.toml` - Netlify configuration file

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
