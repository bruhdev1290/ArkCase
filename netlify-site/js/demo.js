// ArkCase Demo - Interactive JavaScript with localStorage persistence

// =====================
// Data Store (localStorage)
// =====================
const DataStore = {
    KEYS: {
        CASES: 'arkcase_demo_cases',
        TASKS: 'arkcase_demo_tasks',
        DOCUMENTS: 'arkcase_demo_documents',
        SETTINGS: 'arkcase_demo_settings'
    },

    // Get data from localStorage
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    // Save data to localStorage
    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Initialize with default data if empty
    init() {
        if (!this.get(this.KEYS.CASES)) {
            this.set(this.KEYS.CASES, []);
        }
        if (!this.get(this.KEYS.TASKS)) {
            this.set(this.KEYS.TASKS, []);
        }
        if (!this.get(this.KEYS.DOCUMENTS)) {
            this.set(this.KEYS.DOCUMENTS, []);
        }
        if (!this.get(this.KEYS.SETTINGS)) {
            this.set(this.KEYS.SETTINGS, { 
                userName: 'Demo User',
                caseCounter: 1,
                taskCounter: 1
            });
        }
    },

    // Clear all data
    clearAll() {
        Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
        this.init();
    },

    // Generate next case number
    getNextCaseNumber() {
        const settings = this.get(this.KEYS.SETTINGS);
        const year = new Date().getFullYear();
        const num = settings.caseCounter.toString().padStart(3, '0');
        settings.caseCounter++;
        this.set(this.KEYS.SETTINGS, settings);
        return `CASE-${year}-${num}`;
    },

    // Generate next task ID
    getNextTaskId() {
        const settings = this.get(this.KEYS.SETTINGS);
        const id = settings.taskCounter++;
        this.set(this.KEYS.SETTINGS, settings);
        return id;
    }
};

// Initialize DataStore
DataStore.init();

// =====================
// App State
// =====================
let currentCases = DataStore.get(DataStore.KEYS.CASES) || [];
let currentTasks = DataStore.get(DataStore.KEYS.TASKS) || [];
let currentDocuments = DataStore.get(DataStore.KEYS.DOCUMENTS) || [];

// =====================
// Render Functions
// =====================
function renderCasesTable() {
    const tbody = document.querySelector('#cases .data-table tbody');
    if (!tbody) return;

    if (currentCases.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #64748b;">
                    No cases yet. Click "+ New Case" to create your first case.
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = currentCases.map(c => `
            <tr data-case-id="${c.id}">
                <td><a href="#" class="case-link">${c.caseNumber}</a></td>
                <td>${escapeHtml(c.title)}</td>
                <td>${c.type}</td>
                <td><span class="status status-${c.status.toLowerCase()}">${c.status}</span></td>
                <td><span class="priority priority-${c.priority.toLowerCase()}">${c.priority}</span></td>
                <td>${escapeHtml(c.assignee)}</td>
                <td>${formatDate(c.created)}</td>
                <td>
                    <button class="btn-icon" title="View" onclick="viewCase('${c.id}')">👁️</button>
                    <button class="btn-icon" title="Edit" onclick="editCase('${c.id}')">✏️</button>
                    <button class="btn-icon" title="Delete" onclick="deleteCase('${c.id}')">🗑️</button>
                </td>
            </tr>
        `).join('');
    }

    // Update dashboard recent cases
    renderDashboardCases();
    updateDashboardStats();
}

function renderDashboardCases() {
    const tbody = document.querySelector('#dashboard .widget .data-table tbody');
    if (!tbody) return;

    const recentCases = currentCases.slice(0, 4);
    if (recentCases.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 1rem; color: #64748b;">
                    No cases yet.
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = recentCases.map(c => `
            <tr>
                <td>${c.caseNumber}</td>
                <td>${escapeHtml(c.title)}</td>
                <td><span class="status status-${c.status.toLowerCase()}">${c.status}</span></td>
                <td>${escapeHtml(c.assignee)}</td>
            </tr>
        `).join('');
    }
}

function renderTasksBoard() {
    const columns = {
        'todo': document.querySelector('.task-column:nth-child(1) .task-cards'),
        'inprogress': document.querySelector('.task-column:nth-child(2) .task-cards'),
        'review': document.querySelector('.task-column:nth-child(3) .task-cards'),
        'done': document.querySelector('.task-column:nth-child(4) .task-cards')
    };

    // Clear all columns
    Object.values(columns).forEach(col => {
        if (col) col.innerHTML = '';
    });

    if (currentTasks.length === 0) {
        if (columns.todo) {
            columns.todo.innerHTML = `<p style="text-align: center; color: #64748b; padding: 1rem;">No tasks yet</p>`;
        }
    } else {
        currentTasks.forEach(task => {
            const col = columns[task.status.toLowerCase().replace(/\s+/g, '')];
            if (col) {
                col.innerHTML += `
                    <div class="task-card ${task.status === 'done' ? 'completed' : ''}" draggable="true" data-task-id="${task.id}">
                        <div class="task-card-header">
                            <span class="priority priority-${task.priority.toLowerCase()}">${task.priority}</span>
                            <button class="btn-icon small" onclick="deleteTask(${task.id})" title="Delete">×</button>
                        </div>
                        <h4>${escapeHtml(task.title)}</h4>
                        <p>${task.caseNumber || 'No case'}</p>
                        <div class="task-card-footer">
                            <span>Due: ${formatDate(task.dueDate)}</span>
                            <span class="assignee">👤 ${getInitials(task.assignee)}</span>
                        </div>
                    </div>
                `;
            }
        });
    }

    // Update dashboard tasks
    renderDashboardTasks();
    updateDashboardStats();
}

function renderDashboardTasks() {
    const taskList = document.querySelector('#dashboard .task-list');
    if (!taskList) return;

    const pendingTasks = currentTasks.filter(t => t.status !== 'done').slice(0, 4);
    if (pendingTasks.length === 0) {
        taskList.innerHTML = `<li style="text-align: center; color: #64748b; padding: 1rem;">No pending tasks</li>`;
    } else {
        taskList.innerHTML = pendingTasks.map(t => `
            <li class="task-item">
                <input type="checkbox" id="dash-task-${t.id}" onchange="toggleTask(${t.id}, this.checked)">
                <label for="dash-task-${t.id}">${escapeHtml(t.title)}</label>
                <span class="task-due">Due: ${formatDate(t.dueDate)}</span>
            </li>
        `).join('');
    }
}

function renderDocumentsList() {
    const tbody = document.querySelector('#documents .document-list .data-table tbody');
    if (!tbody) return;

    if (currentDocuments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: #64748b;">
                    No documents yet. Click "📤 Upload" to add a document.
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = currentDocuments.map(d => `
            <tr data-doc-id="${d.id}">
                <td>📄 ${escapeHtml(d.name)}</td>
                <td>${d.type}</td>
                <td>${d.size}</td>
                <td>${formatDate(d.modified)}</td>
                <td>
                    <button class="btn-icon" title="Delete" onclick="deleteDocument(${d.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    }
    updateDashboardStats();
}

function updateDashboardStats() {
    const activeCases = currentCases.filter(c => c.status === 'Active').length;
    const pendingTasks = currentTasks.filter(t => t.status !== 'done').length;
    const docCount = currentDocuments.length;

    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 3) {
        statValues[0].textContent = activeCases;
        statValues[1].textContent = pendingTasks;
        statValues[2].textContent = docCount;
    }

    // Update chart
    updateChart();
}

function updateChart() {
    const bars = document.querySelectorAll('.bar-chart .bar');
    if (bars.length < 4) return;

    const statuses = ['Active', 'Pending', 'Review', 'Complete'];
    const counts = statuses.map(s => currentCases.filter(c => c.status === s).length);
    const max = Math.max(...counts, 1);

    bars.forEach((bar, i) => {
        const height = (counts[i] / max) * 100;
        bar.style.height = `${Math.max(height, 5)}%`;
        bar.title = `${statuses[i]}: ${counts[i]}`;
    });
}

// =====================
// CRUD Operations
// =====================
function addCase(caseData) {
    const newCase = {
        id: Date.now().toString(),
        caseNumber: DataStore.getNextCaseNumber(),
        title: caseData.title,
        type: caseData.type,
        status: 'Active',
        priority: caseData.priority,
        assignee: caseData.assignee,
        description: caseData.description || '',
        created: new Date().toISOString()
    };
    currentCases.unshift(newCase);
    DataStore.set(DataStore.KEYS.CASES, currentCases);
    renderCasesTable();
    addActivityItem(`New case created: ${newCase.caseNumber}`);
    return newCase;
}

function deleteCase(id) {
    if (confirm('Are you sure you want to delete this case?')) {
        currentCases = currentCases.filter(c => c.id !== id);
        DataStore.set(DataStore.KEYS.CASES, currentCases);
        renderCasesTable();
    }
}

function viewCase(id) {
    const caseItem = currentCases.find(c => c.id === id);
    if (!caseItem) return;

    showModal('viewCase', caseItem);
}

function editCase(id) {
    const caseItem = currentCases.find(c => c.id === id);
    if (!caseItem) return;

    showModal('editCase', caseItem);
}

function updateCase(id, updates) {
    const index = currentCases.findIndex(c => c.id === id);
    if (index !== -1) {
        currentCases[index] = { ...currentCases[index], ...updates };
        DataStore.set(DataStore.KEYS.CASES, currentCases);
        renderCasesTable();
    }
}

function addTask(taskData) {
    const newTask = {
        id: DataStore.getNextTaskId(),
        title: taskData.title,
        caseNumber: taskData.caseNumber || '',
        priority: taskData.priority,
        status: 'todo',
        dueDate: taskData.dueDate,
        assignee: taskData.assignee,
        created: new Date().toISOString()
    };
    currentTasks.unshift(newTask);
    DataStore.set(DataStore.KEYS.TASKS, currentTasks);
    renderTasksBoard();
    addActivityItem(`New task created: ${newTask.title}`);
    return newTask;
}

function deleteTask(id) {
    currentTasks = currentTasks.filter(t => t.id !== id);
    DataStore.set(DataStore.KEYS.TASKS, currentTasks);
    renderTasksBoard();
}

function toggleTask(id, completed) {
    const task = currentTasks.find(t => t.id === id);
    if (task) {
        task.status = completed ? 'done' : 'todo';
        DataStore.set(DataStore.KEYS.TASKS, currentTasks);
        renderTasksBoard();
        if (completed) {
            addActivityItem(`Task completed: ${task.title}`);
        }
    }
}

function addDocument(docData) {
    const newDoc = {
        id: Date.now().toString(),
        name: docData.name,
        type: docData.type || 'File',
        size: docData.size || 'N/A',
        caseNumber: docData.caseNumber || '',
        description: docData.description || '',
        modified: new Date().toISOString()
    };
    currentDocuments.unshift(newDoc);
    DataStore.set(DataStore.KEYS.DOCUMENTS, currentDocuments);
    renderDocumentsList();
    addActivityItem(`Document uploaded: ${newDoc.name}`);
    return newDoc;
}

function deleteDocument(id) {
    if (confirm('Are you sure you want to delete this document?')) {
        currentDocuments = currentDocuments.filter(d => d.id !== id);
        DataStore.set(DataStore.KEYS.DOCUMENTS, currentDocuments);
        renderDocumentsList();
    }
}

// =====================
// Activity Timeline
// =====================
function addActivityItem(text) {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const item = document.createElement('div');
    item.className = 'timeline-item new';
    item.innerHTML = `
        <span class="timeline-time">${timeStr}</span>
        <span class="timeline-event">${escapeHtml(text)}</span>
    `;
    timeline.insertBefore(item, timeline.firstChild);

    // Keep only last 10 items
    while (timeline.children.length > 10) {
        timeline.removeChild(timeline.lastChild);
    }
}

// =====================
// Helper Functions
// =====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function getCaseOptions() {
    return currentCases.map(c => `<option value="${c.caseNumber}">${c.caseNumber}</option>`).join('');
}

// =====================
// DOM Ready
// =====================
document.addEventListener('DOMContentLoaded', function() {
    // Render initial data
    renderCasesTable();
    renderTasksBoard();
    renderDocumentsList();
    updateDashboardStats();

    // Navigation handling
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                }
            });
        });
    });

    // Global search
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                navItems.forEach(nav => nav.classList.remove('active'));
                document.querySelector('[data-section="search"]').classList.add('active');
                
                sections.forEach(section => section.classList.remove('active'));
                document.getElementById('search').classList.add('active');
                
                document.getElementById('searchTerms').value = this.value;
                performSearch(this.value);
            }
        });
    }

    // Folder tree toggle
    const folders = document.querySelectorAll('.folder > span');
    folders.forEach(folder => {
        folder.addEventListener('click', function() {
            this.parentElement.classList.toggle('open');
        });
    });

    // Filter functionality
    const statusFilter = document.getElementById('statusFilter');
    const assigneeFilter = document.getElementById('assigneeFilter');
    
    if (statusFilter) statusFilter.addEventListener('change', filterCases);
    if (assigneeFilter) assigneeFilter.addEventListener('change', filterCases);

    // Clear data button
    addClearDataButton();
});

// Modal functions
function showModal(type, data = null) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    let title = '';
    let body = '';

    switch(type) {
        case 'newCase':
            title = 'Create New Case';
            body = `
                <form id="caseForm">
                    <div class="form-group">
                        <label>Case Title *</label>
                        <input type="text" id="caseTitle" placeholder="Enter case title" required>
                    </div>
                    <div class="form-group">
                        <label>Case Type *</label>
                        <select id="caseType" required>
                            <option value="">Select type...</option>
                            <option value="IT Request">IT Request</option>
                            <option value="Audit">Audit</option>
                            <option value="Incident">Incident</option>
                            <option value="FOIA">FOIA</option>
                            <option value="Finance">Finance</option>
                            <option value="HR">HR</option>
                            <option value="Legal">Legal</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Priority *</label>
                        <select id="casePriority" required>
                            <option value="">Select priority...</option>
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Assign To *</label>
                        <input type="text" id="caseAssignee" placeholder="Enter assignee name" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="caseDescription" placeholder="Enter case description..." rows="3"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Case</button>
                    </div>
                </form>
            `;
            break;

        case 'editCase':
            title = 'Edit Case';
            body = `
                <form id="editCaseForm">
                    <input type="hidden" id="editCaseId" value="${data.id}">
                    <div class="form-group">
                        <label>Case Number</label>
                        <input type="text" value="${data.caseNumber}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Case Title *</label>
                        <input type="text" id="editCaseTitle" value="${escapeHtml(data.title)}" required>
                    </div>
                    <div class="form-group">
                        <label>Status *</label>
                        <select id="editCaseStatus" required>
                            <option value="Active" ${data.status === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Pending" ${data.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Review" ${data.status === 'Review' ? 'selected' : ''}>Review</option>
                            <option value="Complete" ${data.status === 'Complete' ? 'selected' : ''}>Complete</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Priority *</label>
                        <select id="editCasePriority" required>
                            <option value="Critical" ${data.priority === 'Critical' ? 'selected' : ''}>Critical</option>
                            <option value="High" ${data.priority === 'High' ? 'selected' : ''}>High</option>
                            <option value="Medium" ${data.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                            <option value="Low" ${data.priority === 'Low' ? 'selected' : ''}>Low</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Assign To *</label>
                        <input type="text" id="editCaseAssignee" value="${escapeHtml(data.assignee)}" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            `;
            break;

        case 'viewCase':
            title = `Case: ${data.caseNumber}`;
            body = `
                <div class="case-details">
                    <div class="detail-row">
                        <span class="detail-label">Title:</span>
                        <span class="detail-value">${escapeHtml(data.title)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">${data.type}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value"><span class="status status-${data.status.toLowerCase()}">${data.status}</span></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Priority:</span>
                        <span class="detail-value"><span class="priority priority-${data.priority.toLowerCase()}">${data.priority}</span></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Assigned To:</span>
                        <span class="detail-value">${escapeHtml(data.assignee)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Created:</span>
                        <span class="detail-value">${formatDate(data.created)}</span>
                    </div>
                    ${data.description ? `
                    <div class="detail-row">
                        <span class="detail-label">Description:</span>
                        <span class="detail-value">${escapeHtml(data.description)}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
                    <button type="button" class="btn btn-primary" onclick="editCase('${data.id}')">Edit</button>
                </div>
            `;
            break;

        case 'newTask':
            title = 'Create New Task';
            body = `
                <form id="taskForm">
                    <div class="form-group">
                        <label>Task Title *</label>
                        <input type="text" id="taskTitle" placeholder="Enter task title" required>
                    </div>
                    <div class="form-group">
                        <label>Related Case</label>
                        <select id="taskCase">
                            <option value="">No case</option>
                            ${getCaseOptions()}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Priority *</label>
                        <select id="taskPriority" required>
                            <option value="">Select priority...</option>
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Due Date *</label>
                        <input type="date" id="taskDueDate" required>
                    </div>
                    <div class="form-group">
                        <label>Assign To *</label>
                        <input type="text" id="taskAssignee" placeholder="Enter assignee name" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Task</button>
                    </div>
                </form>
            `;
            break;

        case 'uploadDoc':
            title = 'Add Document';
            body = `
                <form id="docForm">
                    <div class="form-group">
                        <label>Document Name *</label>
                        <input type="text" id="docName" placeholder="e.g., Report_2024.pdf" required>
                    </div>
                    <div class="form-group">
                        <label>Document Type</label>
                        <select id="docType">
                            <option value="PDF">PDF</option>
                            <option value="Word">Word</option>
                            <option value="Excel">Excel</option>
                            <option value="Image">Image</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>File Size</label>
                        <input type="text" id="docSize" placeholder="e.g., 2.4 MB">
                    </div>
                    <div class="form-group">
                        <label>Related Case</label>
                        <select id="docCase">
                            <option value="">No case</option>
                            ${getCaseOptions()}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="docDescription" placeholder="Enter document description..." rows="2"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Add Document</button>
                    </div>
                </form>
            `;
            break;
    }

    modalTitle.textContent = title;
    modalBody.innerHTML = body;
    modal.classList.add('active');

    // Add form styles
    addFormStyles();

    // Attach form handlers
    setTimeout(() => {
        const caseForm = document.getElementById('caseForm');
        if (caseForm) {
            caseForm.addEventListener('submit', handleCaseSubmit);
        }

        const editCaseForm = document.getElementById('editCaseForm');
        if (editCaseForm) {
            editCaseForm.addEventListener('submit', handleEditCaseSubmit);
        }

        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', handleTaskSubmit);
        }

        const docForm = document.getElementById('docForm');
        if (docForm) {
            docForm.addEventListener('submit', handleDocSubmit);
        }
    }, 0);
}

function handleCaseSubmit(e) {
    e.preventDefault();
    const caseData = {
        title: document.getElementById('caseTitle').value,
        type: document.getElementById('caseType').value,
        priority: document.getElementById('casePriority').value,
        assignee: document.getElementById('caseAssignee').value,
        description: document.getElementById('caseDescription').value
    };
    const newCase = addCase(caseData);
    showSuccessMessage('Case', newCase.caseNumber);
}

function handleEditCaseSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('editCaseId').value;
    const updates = {
        title: document.getElementById('editCaseTitle').value,
        status: document.getElementById('editCaseStatus').value,
        priority: document.getElementById('editCasePriority').value,
        assignee: document.getElementById('editCaseAssignee').value
    };
    updateCase(id, updates);
    showSuccessMessage('Case', 'updated');
}

function handleTaskSubmit(e) {
    e.preventDefault();
    const taskData = {
        title: document.getElementById('taskTitle').value,
        caseNumber: document.getElementById('taskCase').value,
        priority: document.getElementById('taskPriority').value,
        dueDate: document.getElementById('taskDueDate').value,
        assignee: document.getElementById('taskAssignee').value
    };
    addTask(taskData);
    showSuccessMessage('Task');
}

function handleDocSubmit(e) {
    e.preventDefault();
    const docData = {
        name: document.getElementById('docName').value,
        type: document.getElementById('docType').value,
        size: document.getElementById('docSize').value || 'N/A',
        caseNumber: document.getElementById('docCase').value,
        description: document.getElementById('docDescription').value
    };
    addDocument(docData);
    showSuccessMessage('Document');
}

function showSuccessMessage(type, extra = '') {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
            <h3 style="margin-bottom: 0.5rem;">Success!</h3>
            <p style="color: #64748b;">${type} ${extra ? extra + ' ' : ''}has been saved successfully.</p>
            <p style="color: #22c55e; font-size: 0.875rem; margin-top: 1rem;">
                ✓ Data saved to browser localStorage
            </p>
            <button class="btn btn-primary" onclick="closeModal()" style="margin-top: 1rem;">Close</button>
        </div>
    `;
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
}

function filterCases() {
    const statusFilter = document.getElementById('statusFilter').value;
    const assigneeFilter = document.getElementById('assigneeFilter').value;
    
    const rows = document.querySelectorAll('#cases .data-table tbody tr');
    
    rows.forEach(row => {
        if (row.querySelector('td[colspan]')) return; // Skip empty message row
        
        let show = true;
        
        if (statusFilter) {
            const status = row.querySelector('.status');
            if (status && !status.classList.contains('status-' + statusFilter)) {
                show = false;
            }
        }

        if (assigneeFilter && show) {
            const assigneeCell = row.querySelector('td:nth-child(6)');
            if (assigneeCell && !assigneeCell.textContent.toLowerCase().includes(assigneeFilter.toLowerCase())) {
                show = false;
            }
        }
        
        row.style.display = show ? '' : 'none';
    });
}

function performSearch(query) {
    const resultsDiv = document.querySelector('.search-results');
    
    if (!query.trim()) {
        resultsDiv.innerHTML = '<p class="search-hint">Enter search terms to find cases, documents, tasks, and more.</p>';
        return;
    }

    const q = query.toLowerCase();
    
    // Search in cases
    const matchingCases = currentCases.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.caseNumber.toLowerCase().includes(q) ||
        c.assignee.toLowerCase().includes(q)
    );

    // Search in tasks
    const matchingTasks = currentTasks.filter(t => 
        t.title.toLowerCase().includes(q) ||
        (t.caseNumber && t.caseNumber.toLowerCase().includes(q))
    );

    // Search in documents
    const matchingDocs = currentDocuments.filter(d => 
        d.name.toLowerCase().includes(q)
    );

    let resultsHtml = `<h3>Search Results for "${escapeHtml(query)}"</h3>`;
    
    if (matchingCases.length === 0 && matchingTasks.length === 0 && matchingDocs.length === 0) {
        resultsHtml += '<p style="color: #64748b; padding: 1rem;">No results found.</p>';
    } else {
        resultsHtml += '<div class="search-result-list">';
        
        matchingCases.forEach(c => {
            resultsHtml += `
                <div class="search-result-item">
                    <span class="result-type">📋 Case</span>
                    <h4><a href="#" onclick="viewCase('${c.id}'); return false;">${c.caseNumber} - ${escapeHtml(c.title)}</a></h4>
                    <p>Status: ${c.status} | Priority: ${c.priority} | Assigned: ${escapeHtml(c.assignee)}</p>
                </div>
            `;
        });

        matchingTasks.forEach(t => {
            resultsHtml += `
                <div class="search-result-item">
                    <span class="result-type">✅ Task</span>
                    <h4>${escapeHtml(t.title)}</h4>
                    <p>Case: ${t.caseNumber || 'None'} | Due: ${formatDate(t.dueDate)} | Status: ${t.status}</p>
                </div>
            `;
        });

        matchingDocs.forEach(d => {
            resultsHtml += `
                <div class="search-result-item">
                    <span class="result-type">📄 Document</span>
                    <h4>${escapeHtml(d.name)}</h4>
                    <p>Type: ${d.type} | Size: ${d.size}</p>
                </div>
            `;
        });

        resultsHtml += '</div>';
    }

    resultsHtml += `
        <style>
            .search-result-list { margin-top: 1rem; }
            .search-result-item {
                padding: 1rem;
                border-bottom: 1px solid #e2e8f0;
            }
            .search-result-item:last-child { border-bottom: none; }
            .result-type {
                display: inline-block;
                padding: 0.25rem 0.5rem;
                background: #f1f5f9;
                border-radius: 0.25rem;
                font-size: 0.75rem;
                color: #64748b;
            }
            .search-result-item h4 {
                margin: 0.5rem 0;
            }
            .search-result-item h4 a {
                color: #3b82f6;
                text-decoration: none;
            }
            .search-result-item h4 a:hover {
                text-decoration: underline;
            }
            .search-result-item p {
                margin: 0;
                color: #64748b;
                font-size: 0.875rem;
            }
        </style>
    `;
    
    resultsDiv.innerHTML = resultsHtml;
}

function addFormStyles() {
    if (document.getElementById('form-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'form-styles';
    styles.textContent = `
        .form-group {
            margin-bottom: 1rem;
        }
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 0.875rem;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .form-group input:disabled {
            background: #f3f4f6;
            color: #6b7280;
        }
        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
        }
        .case-details {
            padding: 0.5rem 0;
        }
        .detail-row {
            display: flex;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            width: 120px;
            font-weight: 500;
            color: #64748b;
        }
        .detail-value {
            flex: 1;
            color: #1e293b;
        }
        .btn-icon.small {
            font-size: 0.75rem;
            padding: 0.125rem 0.25rem;
            opacity: 0.5;
        }
        .btn-icon.small:hover {
            opacity: 1;
        }
    `;
    document.head.appendChild(styles);
}

function addClearDataButton() {
    const sidebarFooter = document.querySelector('.sidebar-footer');
    if (sidebarFooter) {
        const clearBtn = document.createElement('button');
        clearBtn.className = 'clear-data-btn';
        clearBtn.textContent = '🗑️ Clear All Data';
        clearBtn.onclick = function() {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                DataStore.clearAll();
                currentCases = [];
                currentTasks = [];
                currentDocuments = [];
                renderCasesTable();
                renderTasksBoard();
                renderDocumentsList();
                updateDashboardStats();
                alert('All data has been cleared.');
            }
        };
        
        const style = document.createElement('style');
        style.textContent = `
            .clear-data-btn {
                display: block;
                width: 100%;
                margin-top: 0.5rem;
                padding: 0.5rem;
                background: transparent;
                border: 1px solid #475569;
                color: #94a3b8;
                border-radius: 0.25rem;
                cursor: pointer;
                font-size: 0.75rem;
            }
            .clear-data-btn:hover {
                background: #334155;
                color: white;
            }
            .timeline-item.new {
                animation: fadeIn 0.3s ease-in;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
        sidebarFooter.appendChild(clearBtn);
    }
}

// Close modal on outside click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('modal');
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});
