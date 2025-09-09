class LaunchPageBuilder {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.propertiesPanel = document.getElementById('propertiesPanel');
        this.selectedComponent = null;
        this.componentCounter = 0;
        this.history = [];
        this.historyIndex = -1;

        this.init();
    }

    init() {
        this.setupDragAndDrop();
        this.setupEventListeners();
        this.setupTemplates();
    }

    setupEventListeners() {
        document.getElementById('previewBtn').addEventListener('click', () => this.showPreview());
        document.getElementById('publishBtn').addEventListener('click', () => this.publish());
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('clearBtn').addEventListener('click', () => this.clear());
        document.getElementById('closePreview').addEventListener('click', () => this.closePreview());

        this.canvas.addEventListener('click', (e) => {
            if (e.target.closest('.component')) {
                this.selectComponent(e.target.closest('.component'));
            }
        });
    }

    setupDragAndDrop() {
        const componentItems = document.querySelectorAll('.component-item');
        
        componentItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.component);
            });
        });

        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.canvas.classList.add('drag-over');
        });

        this.canvas.addEventListener('dragleave', (e) => {
            if (!this.canvas.contains(e.relatedTarget)) {
                this.canvas.classList.remove('drag-over');
            }
        });

        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            this.canvas.classList.remove('drag-over');
            const componentType = e.dataTransfer.getData('text/plain');
            this.addComponent(componentType);
        });
    }

    setupTemplates() {
        const templateCards = document.querySelectorAll('.template-card');
        templateCards.forEach(card => {
            card.addEventListener('click', () => {
                const templateType = card.dataset.template;
                this.loadTemplate(templateType);
            });
        });
    }

    loadTemplate(templateType) {
        this.clear();
        
        const templates = {
            startup: ['hero', 'features', 'testimonials', 'pricing', 'cta'],
            product: ['hero', 'features', 'pricing', 'testimonials', 'contact'],
            event: ['hero', 'cta', 'features', 'contact']
        };

        const components = templates[templateType] || [];
        components.forEach(componentType => {
            this.addComponent(componentType);
        });

        this.saveState();
    }

    addComponent(type) {
        const dropZone = this.canvas.querySelector('.drop-zone');
        if (dropZone) {
            dropZone.remove();
        }

        const component = document.createElement('div');
        component.className = 'component';
        component.dataset.type = type;
        component.dataset.id = ++this.componentCounter;

        component.innerHTML = this.getComponentHTML(type) + `
            <div class="component-controls">
                <button class="control-btn" onclick="builder.removeComponent(this.parentElement.parentElement)">×</button>
            </div>
        `;

        this.canvas.appendChild(component);
        this.saveState();
        this.selectComponent(component);
    }

    getComponentHTML(type) {
        const templates = {
            hero: `
                <div class="hero-component">
                    <h1>Launch Your Amazing Product</h1>
                    <p>Transform your ideas into reality with our innovative solution</p>
                    <a href="#" class="hero-cta">Get Started Today</a>
                </div>
            `,
            features: `
                <div class="features-component">
                    <h2 style="text-align: center; margin-bottom: 2rem;">Key Features</h2>
                    <div class="features-grid">
                        <div class="feature">
                            <div class="feature-icon">🚀</div>
                            <h3>Fast & Reliable</h3>
                            <p>Lightning-fast performance you can count on</p>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">🔒</div>
                            <h3>Secure</h3>
                            <p>Enterprise-grade security for peace of mind</p>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">📱</div>
                            <h3>Mobile-First</h3>
                            <p>Perfectly optimized for all devices</p>
                        </div>
                    </div>
                </div>
            `,
            testimonials: `
                <div style="padding: 4rem 2rem; background: #f8fafc;">
                    <h2 style="text-align: center; margin-bottom: 2rem;">What Our Customers Say</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                        <div style="background: white; padding: 2rem; border-radius: 0.5rem; text-align: center;">
                            <p style="margin-bottom: 1rem; font-style: italic;">"This product changed our entire workflow. Amazing!"</p>
                            <strong>- Sarah Johnson, CEO</strong>
                        </div>
                        <div style="background: white; padding: 2rem; border-radius: 0.5rem; text-align: center;">
                            <p style="margin-bottom: 1rem; font-style: italic;">"Best investment we've made this year."</p>
                            <strong>- Mike Chen, CTO</strong>
                        </div>
                    </div>
                </div>
            `,
            pricing: `
                <div style="padding: 4rem 2rem;">
                    <h2 style="text-align: center; margin-bottom: 2rem;">Simple Pricing</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; max-width: 800px; margin: 0 auto;">
                        <div style="border: 2px solid #e5e7eb; border-radius: 0.5rem; padding: 2rem; text-align: center;">
                            <h3 style="margin-bottom: 1rem;">Starter</h3>
                            <div style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem;">$29<span style="font-size: 1rem; color: #6b7280;">/month</span></div>
                            <button style="width: 100%; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">Choose Plan</button>
                        </div>
                        <div style="border: 2px solid #3b82f6; border-radius: 0.5rem; padding: 2rem; text-align: center; transform: scale(1.05);">
                            <h3 style="margin-bottom: 1rem;">Pro</h3>
                            <div style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem;">$79<span style="font-size: 1rem; color: #6b7280;">/month</span></div>
                            <button style="width: 100%; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">Choose Plan</button>
                        </div>
                    </div>
                </div>
            `,
            cta: `
                <div style="padding: 4rem 2rem; background: #1f2937; color: white; text-align: center;">
                    <h2 style="margin-bottom: 1rem; font-size: 2.5rem;">Ready to Get Started?</h2>
                    <p style="margin-bottom: 2rem; font-size: 1.25rem; opacity: 0.9;">Join thousands of satisfied customers today</p>
                    <button style="padding: 1rem 2rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; font-size: 1.125rem; cursor: pointer;">Start Free Trial</button>
                </div>
            `,
            contact: `
                <div style="padding: 4rem 2rem;">
                    <h2 style="text-align: center; margin-bottom: 2rem;">Get In Touch</h2>
                    <div style="max-width: 600px; margin: 0 auto;">
                        <form style="display: grid; gap: 1rem;">
                            <input type="text" placeholder="Your Name" style="padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem;">
                            <input type="email" placeholder="Your Email" style="padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem;">
                            <textarea placeholder="Your Message" rows="5" style="padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; resize: vertical;"></textarea>
                            <button type="submit" style="padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">Send Message</button>
                        </form>
                    </div>
                </div>
            `
        };

        return templates[type] || '<div>Unknown component</div>';
    }

    selectComponent(component) {
        if (this.selectedComponent) {
            this.selectedComponent.classList.remove('selected');
        }
        
        this.selectedComponent = component;
        component.classList.add('selected');
        this.updatePropertiesPanel(component);
    }

    updatePropertiesPanel(component) {
        const type = component.dataset.type;
        const propertiesContent = this.propertiesPanel.querySelector('.properties-content');
        
        let html = `
            <div class="form-group">
                <label class="form-label">Component Type</label>
                <input type="text" class="form-input" value="${type}" readonly>
            </div>
        `;

        if (type === 'hero') {
            const title = component.querySelector('h1').textContent;
            const subtitle = component.querySelector('p').textContent;
            const buttonText = component.querySelector('.hero-cta').textContent;
            
            html += `
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" class="form-input" value="${title}" onchange="builder.updateComponentContent('${component.dataset.id}', 'title', this.value)">
                </div>
                <div class="form-group">
                    <label class="form-label">Subtitle</label>
                    <textarea class="form-input" onchange="builder.updateComponentContent('${component.dataset.id}', 'subtitle', this.value)">${subtitle}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Button Text</label>
                    <input type="text" class="form-input" value="${buttonText}" onchange="builder.updateComponentContent('${component.dataset.id}', 'buttonText', this.value)">
                </div>
            `;
        }

        propertiesContent.innerHTML = html;
    }

    updateComponentContent(componentId, property, value) {
        const component = this.canvas.querySelector(`[data-id="${componentId}"]`);
        if (!component) return;

        const type = component.dataset.type;

        if (type === 'hero') {
            switch (property) {
                case 'title':
                    component.querySelector('h1').textContent = value;
                    break;
                case 'subtitle':
                    component.querySelector('p').textContent = value;
                    break;
                case 'buttonText':
                    component.querySelector('.hero-cta').textContent = value;
                    break;
            }
        }

        this.saveState();
    }

    removeComponent(component) {
        if (this.selectedComponent === component) {
            this.selectedComponent = null;
            this.propertiesPanel.querySelector('.properties-content').innerHTML = '<p>Select a component to edit its properties</p>';
        }
        
        component.remove();
        
        if (this.canvas.children.length === 0) {
            this.canvas.innerHTML = `
                <div class="drop-zone">
                    <div class="drop-zone-content">
                        <h3>Start Building Your Landing Page</h3>
                        <p>Choose a template or drag components from the sidebar</p>
                    </div>
                </div>
            `;
        }
        
        this.saveState();
    }

    saveState() {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(this.canvas.innerHTML);
        this.historyIndex++;
        
        if (this.history.length > 20) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.canvas.innerHTML = this.history[this.historyIndex];
            this.selectedComponent = null;
            this.propertiesPanel.querySelector('.properties-content').innerHTML = '<p>Select a component to edit its properties</p>';
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.canvas.innerHTML = this.history[this.historyIndex];
            this.selectedComponent = null;
            this.propertiesPanel.querySelector('.properties-content').innerHTML = '<p>Select a component to edit its properties</p>';
        }
    }

    clear() {
        this.canvas.innerHTML = `
            <div class="drop-zone">
                <div class="drop-zone-content">
                    <h3>Start Building Your Landing Page</h3>
                    <p>Choose a template or drag components from the sidebar</p>
                </div>
            </div>
        `;
        this.selectedComponent = null;
        this.propertiesPanel.querySelector('.properties-content').innerHTML = '<p>Select a component to edit its properties</p>';
        this.saveState();
    }

    showPreview() {
        const modal = document.getElementById('previewModal');
        const frame = document.getElementById('previewFrame');
        
        const html = this.generatePreviewHTML();
        frame.srcdoc = html;
        modal.style.display = 'block';
    }

    closePreview() {
        document.getElementById('previewModal').style.display = 'none';
    }

    generatePreviewHTML() {
        const components = this.canvas.querySelectorAll('.component');
        let content = '';
        
        components.forEach(component => {
            const componentContent = component.cloneNode(true);
            componentContent.querySelector('.component-controls')?.remove();
            componentContent.classList.remove('component', 'selected');
            content += componentContent.innerHTML;
        });

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Preview - Landing Page</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
                    .hero-component { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4rem 2rem; }
                    .hero-component h1 { font-size: 3rem; margin-bottom: 1rem; font-weight: 700; }
                    .hero-component p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; }
                    .hero-cta { display: inline-block; padding: 0.75rem 2rem; background: white; color: #3b82f6; border-radius: 0.375rem; text-decoration: none; font-weight: 600; }
                    .features-component { padding: 4rem 2rem; }
                    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 2rem; }
                    .feature { text-align: center; padding: 1.5rem; }
                    .feature-icon { font-size: 2.5rem; margin-bottom: 1rem; }
                    .feature h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
                    @media (max-width: 768px) {
                        .hero-component h1 { font-size: 2rem; }
                        .hero-component p { font-size: 1rem; }
                        .features-grid { grid-template-columns: 1fr; }
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `;
    }

    publish() {
        const html = this.generatePreviewHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'landing-page.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Landing page exported successfully! The HTML file has been downloaded.');
    }
}

const builder = new LaunchPageBuilder();