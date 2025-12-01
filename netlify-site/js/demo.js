// ArkCase Demo - Interactive JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Navigation handling
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
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
                // Switch to search section
                navItems.forEach(nav => nav.classList.remove('active'));
                document.querySelector('[data-section="search"]').classList.add('active');
                
                sections.forEach(section => section.classList.remove('active'));
                document.getElementById('search').classList.add('active');
                
                // Copy search term
                document.getElementById('searchTerms').value = this.value;
                
                // Simulate search
                performSearch(this.value);
            }
        });
    }

    // Task checkboxes
    const taskCheckboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const label = this.nextElementSibling;
            if (this.checked) {
                label.style.textDecoration = 'line-through';
                label.style.color = '#94a3b8';
            } else {
                label.style.textDecoration = 'none';
                label.style.color = '#1e293b';
            }
        });
    });

    // Folder tree toggle
    const folders = document.querySelectorAll('.folder > span');
    folders.forEach(folder => {
        folder.addEventListener('click', function() {
            const parent = this.parentElement;
            parent.classList.toggle('open');
        });
    });

    // Filter functionality
    const statusFilter = document.getElementById('statusFilter');
    const assigneeFilter = document.getElementById('assigneeFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterCases);
    }
    if (assigneeFilter) {
        assigneeFilter.addEventListener('change', filterCases);
    }
});

// Modal functions
function showModal(type) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    let title = '';
    let body = '';

    switch(type) {
        case 'newCase':
            title = 'Create New Case';
            body = `
                <form onsubmit="submitForm(event, 'case')">
                    <div class="form-group">
                        <label>Case Title</label>
                        <input type="text" placeholder="Enter case title" required>
                    </div>
                    <div class="form-group">
                        <label>Case Type</label>
                        <select required>
                            <option value="">Select type...</option>
                            <option>IT Request</option>
                            <option>Audit</option>
                            <option>Incident</option>
                            <option>FOIA</option>
                            <option>Finance</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Priority</label>
                        <select required>
                            <option value="">Select priority...</option>
                            <option>Critical</option>
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Assign To</label>
                        <select required>
                            <option value="">Select assignee...</option>
                            <option>John Smith</option>
                            <option>Jane Doe</option>
                            <option>Mike Johnson</option>
                            <option>Sarah Wilson</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea placeholder="Enter case description..." rows="3"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Case</button>
                    </div>
                </form>
            `;
            break;
        case 'newTask':
            title = 'Create New Task';
            body = `
                <form onsubmit="submitForm(event, 'task')">
                    <div class="form-group">
                        <label>Task Title</label>
                        <input type="text" placeholder="Enter task title" required>
                    </div>
                    <div class="form-group">
                        <label>Related Case</label>
                        <select>
                            <option value="">Select case...</option>
                            <option>CASE-2024-001</option>
                            <option>CASE-2024-002</option>
                            <option>CASE-2024-003</option>
                            <option>CASE-2024-004</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Priority</label>
                        <select required>
                            <option value="">Select priority...</option>
                            <option>Critical</option>
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Due Date</label>
                        <input type="date" required>
                    </div>
                    <div class="form-group">
                        <label>Assign To</label>
                        <select required>
                            <option value="">Select assignee...</option>
                            <option>John Smith</option>
                            <option>Jane Doe</option>
                            <option>Mike Johnson</option>
                            <option>Sarah Wilson</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Task</button>
                    </div>
                </form>
            `;
            break;
        case 'uploadDoc':
            title = 'Upload Document';
            body = `
                <form onsubmit="submitForm(event, 'document')">
                    <div class="form-group">
                        <label>Select File</label>
                        <input type="file" required>
                    </div>
                    <div class="form-group">
                        <label>Document Title</label>
                        <input type="text" placeholder="Enter document title">
                    </div>
                    <div class="form-group">
                        <label>Related Case</label>
                        <select>
                            <option value="">Select case...</option>
                            <option>CASE-2024-001</option>
                            <option>CASE-2024-002</option>
                            <option>CASE-2024-003</option>
                            <option>CASE-2024-004</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea placeholder="Enter document description..." rows="3"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Upload</button>
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
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
}

function submitForm(event, type) {
    event.preventDefault();
    
    // Show success message
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
            <h3 style="margin-bottom: 0.5rem;">Success!</h3>
            <p style="color: #64748b;">Your ${type} has been created successfully.</p>
            <p style="color: #f59e0b; font-size: 0.875rem; margin-top: 1rem;">
                (This is a demo - data is not persisted)
            </p>
            <button class="btn btn-primary" onclick="closeModal()" style="margin-top: 1rem;">Close</button>
        </div>
    `;
}

function filterCases() {
    // Demo filter simulation
    const statusFilter = document.getElementById('statusFilter').value;
    const assigneeFilter = document.getElementById('assigneeFilter').value;
    
    const rows = document.querySelectorAll('#cases .data-table tbody tr');
    
    rows.forEach(row => {
        let show = true;
        
        if (statusFilter) {
            const status = row.querySelector('.status');
            if (status && !status.classList.contains('status-' + statusFilter)) {
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

    // Simulate search results
    resultsDiv.innerHTML = `
        <h3>Search Results for "${query}"</h3>
        <div class="search-result-list">
            <div class="search-result-item">
                <span class="result-type">📋 Case</span>
                <h4><a href="#">CASE-2024-001 - Infrastructure Review Request</a></h4>
                <p>Case matching your search query with relevant content highlighted...</p>
            </div>
            <div class="search-result-item">
                <span class="result-type">📄 Document</span>
                <h4><a href="#">Infrastructure_Review_Report.pdf</a></h4>
                <p>Document containing information related to your search...</p>
            </div>
            <div class="search-result-item">
                <span class="result-type">✅ Task</span>
                <h4><a href="#">Review document submission</a></h4>
                <p>Task related to CASE-2024-001...</p>
            </div>
        </div>
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
}

function addFormStyles() {
    // Check if styles already added
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
        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
        }
    `;
    document.head.appendChild(styles);
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
