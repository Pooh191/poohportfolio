document.addEventListener('DOMContentLoaded', function () {
    // 0. Firebase Configuration (User: Please update with your actual config)
    const firebaseConfig = {
        apiKey: "AIzaSyBebSttbkfL6s_bLcKNswq8ztDjN6c8O78",
        authDomain: "portfolio-45058.firebaseapp.com",
        projectId: "portfolio-45058",
        storageBucket: "portfolio-45058.firebasestorage.app",
        messagingSenderId: "1074440839227",
        appId: "1:1074440839227:web:d78a4b02b208f0b94f3c1e",
        measurementId: "G-0XCEELDJPL"
    };

    // Theme Logic - Run immediately for best UX
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeUI(savedTheme);
    };

    const updateThemeUI = (theme) => {
        const toggleBtn = document.getElementById('dark-mode-toggle');
        const icon = toggleBtn?.querySelector('i');

        if (theme === 'dark') {
            if (icon) icon.className = 'fas fa-sun text-warning';
        } else {
            if (icon) icon.className = 'fas fa-moon text-dark';
        }
    };

    initTheme();

    // Set Current Year in Footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.innerText = new Date().getFullYear();


    // Check if config is filled
    let db = null;
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        try {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
        } catch (error) {
            console.error("Firebase initialization failed:", error);
        }
    } else {
        console.warn("Firebase not initialized: Please provide your config in main.js. The site will run in demo mode.");
    }

    const ADMIN_CODE = "admin123"; //รหัสผ่านแอดมิน (Password)
    window.currentProjectFilter = 'all';



    // 1. Initial State Handling
    const hideLoader = () => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            document.body.classList.remove('loading');
        }
    };

    // Ensure loader is hidden even if something fails
    window.addEventListener('load', hideLoader);
    setTimeout(hideLoader, 3000); // Force hide after 3s as fallback

    // Admin State Check
    const checkAdmin = () => {
        const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
        document.querySelectorAll('.admin-only').forEach(el => {
            el.classList.toggle('d-none', !isAdmin);
        });
        document.querySelectorAll('.guest-only').forEach(el => {
            el.classList.toggle('d-none', isAdmin);
        });
        return isAdmin;
    };

    checkAdmin();

    // Admin Login Logic
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pass = document.getElementById('adminPassword').value;
            if (pass === ADMIN_CODE) {
                sessionStorage.setItem('isAdmin', 'true');
                checkAdmin();
                const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                if (loginModal) loginModal.hide();
                loginForm.reset();
                Swal.fire({
                    title: 'เข้าสู่ระบบแอดมินสำเร็จ!',
                    icon: 'success',
                    confirmButtonColor: '#1e5622',
                    customClass: {
                        title: 'text-success fw-bold',
                        popup: 'rounded-4'
                    }
                });
                renderAll(); // Re-render to show delete buttons
            } else {
                Swal.fire('ผิดพลาด', 'รหัสผ่านไม่ถูกต้อง', 'error');
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Swal.fire({
                title: 'ยืนยันการออกจากระบบ?',
                text: "คุณต้องการออกจากเซสชันปัจจุบันหรือไม่",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#1e5622',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'ออกจากระบบ',
                cancelButtonText: 'ยกเลิก',
                reverseButtons: true,
                customClass: {
                    title: 'fw-bold',
                    popup: 'rounded-4'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    sessionStorage.removeItem('isAdmin');
                    checkAdmin();
                    renderAll();
                    Swal.fire({
                        title: 'ออกจากระบบสำเร็จ',
                        icon: 'success',
                        confirmButtonColor: '#1e5622',
                        customClass: {
                            title: 'text-success fw-bold',
                            popup: 'rounded-4'
                        }
                    });
                }
            });
        });
    }

    // Dynamic Rendering Core
    const renderAll = () => {
        fetchProjects();
        fetchCertificates();
        fetchNews();
        fetchGpax();
        fetchSkills();
        fetchMessages();
    };

    renderAll();

    // --- Dynamic Data Fetching ---

    function fetchProjects() {
        const pContainer = document.getElementById('projects-container');
        const aContainer = document.getElementById('activities-container');
        if (!pContainer || !aContainer) return;

        if (!db) {
            pContainer.innerHTML = '<div class="col-12 text-center text-muted">ไม่ได้เชื่อมต่อฐานข้อมูล</div>';
            return;
        }

        db.collection('projects').onSnapshot(snapshot => {
            pContainer.innerHTML = '';
            aContainer.innerHTML = '';
            const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

            if (snapshot.empty) {
                pContainer.innerHTML = '<div class="col-12 text-center text-muted py-4">ยังไม่มีข้อมูลผลงาน</div>';
                aContainer.innerHTML = '<div class="col-12 text-center text-muted py-4">ยังไม่มีข้อมูลกิจกรรม</div>';
                return;
            }

            const items = [];
            snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));

            items.sort((a, b) => {
                const orderA = a.order !== undefined ? a.order : 999;
                const orderB = b.order !== undefined ? b.order : 999;
                if (orderA !== orderB) return orderA - orderB;
                return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
            });

            let pCount = 0;
            let aCount = 0;

            items.forEach((data) => {
                const col = document.createElement('div');
                col.className = `col-md-6 col-lg-4 project-item ${data.category}`;
                col.setAttribute('data-aos', 'fade-up');
                col.dataset.id = data.id;

                col.innerHTML = `
                    <div class="project-card shadow-lg h-100 position-relative">
                        ${isAdmin ? `<div class="drag-handle position-absolute top-0 start-0 p-2 text-white-50" style="z-index: 11; cursor: grab;"><i class="fas fa-grip-vertical"></i></div>` : ''}
                        <div class="project-img-container position-relative">
                            <img src="${data.image}" alt="${data.title}" class="img-fluid" style="height: 250px; width: 100%; object-fit: cover;">
                            <div class="project-overlay">
                                <h4 class="fw-bold text-white mb-3">${data.title}</h4>
                                <p class="small text-white-50 mb-4">${data.description ? data.description.substring(0, 80) : ''}...</p>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-light rounded-pill px-3 btn-sm fw-bold" onclick="viewProjectDetail('${data.id}')">รายละเอียด</button>
                                    ${data.link ? `<a href="${data.link}" target="_blank" class="btn btn-outline-light rounded-pill px-3 btn-sm fw-bold"><i class="fas fa-external-link-alt"></i></a>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="p-4 bg-white position-relative">
                            ${isAdmin ? `
                            <div class="position-absolute top-0 end-0 p-3 d-flex gap-1" style="z-index: 10;">
                                <button class="btn btn-warning btn-sm rounded-circle shadow-sm" onclick="openEditProject('${data.id}')" title="แก้ไข"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-danger btn-sm rounded-circle shadow-sm" onclick="deleteItem('projects', '${data.id}')" title="ลบ"><i class="fas fa-trash"></i></button>
                            </div>
                            ` : ''}
                            <h5 class="fw-bold mb-2">${data.title}</h5>
                            <span class="badge bg-soft-primary text-primary mb-3 px-3 py-2 rounded-pill category-badge" 
                                  style="cursor: pointer; position: relative; z-index: 10;" 
                                  onclick="event.stopPropagation(); filterByCategory('${data.category}')" 
                                  title="ดูผลงานหมวดนี้">
                                ${data.category === 'academic' ? 'ด้านวิชาการ' :
                        data.category === 'innovation' ? 'ทักษะ & นวัตกรรม' :
                            data.category === 'volunteer' ? 'ด้านจิตอาสา' :
                                data.category === 'leadership' ? 'ด้านความเป็นผู้นำ' :
                                    data.category === 'others' ? 'ด้านอื่น ๆ' : data.category}
                            </span>
                            <div class="mb-2">
                                <p class="text-muted small mb-0"><i class="far fa-calendar-alt me-2 text-primary"></i>${data.date || 'ไม่ระบุวันที่'}</p>
                            </div>
                        </div>
                    </div>
                `;

                if (data.type === 'activity') {
                    aCount++;
                    col.classList.add('is-activity');
                    aContainer.appendChild(col);
                } else {
                    pCount++;
                    col.classList.add('is-project');
                    pContainer.appendChild(col);
                }
            });

            if (pCount === 0) pContainer.innerHTML = '<div class="col-12 text-center text-muted py-4">ยังไม่มีข้อมูลผลงาน</div>';
            if (aCount === 0) aContainer.innerHTML = '<div class="col-12 text-center text-muted py-4">ยังไม่มีข้อมูลกิจกรรม</div>';

            refreshProjectVisibility();

            // Init Drag & Drop for both
            if (isAdmin && typeof Sortable !== 'undefined') {
                [pContainer, aContainer].forEach(c => {
                    Sortable.create(c, {
                        animation: 150,
                        filter: ".btn, button, i, a, .project-overlay, .category-badge",
                        preventOnFilter: false,
                        onEnd: function () {
                            const items = c.querySelectorAll('.project-item');
                            const batch = db.batch();
                            items.forEach((el, i) => {
                                batch.update(db.collection('projects').doc(el.dataset.id), { order: i });
                            });
                            batch.commit().then(() => showToast('อัปเดตลำดับเรียบร้อย', 'success'));
                        }
                    });
                });
            }
        });
    }

    function fetchCertificates() {
        const container = document.getElementById('cert-container');
        if (!container) return;

        if (!db) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-3">ยังไม่ได้เชื่อมต่อฐานข้อมูล</div>';
            return;
        }

        db.collection('certificates').onSnapshot(snapshot => {
            container.innerHTML = '';
            const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

            if (snapshot.empty) {
                container.innerHTML = '<div class="col-12 text-center text-muted py-4">ยังไม่มีข้อมูลเกียรติบัตร</div>';
                toggleShowMoreBtn('certs', false);
                return;
            }
            if (isAdmin) container.classList.add('admin-mode'); else container.classList.remove('admin-mode');

            // Get certificates and sort by 'order'
            const certs = [];
            snapshot.forEach(doc => certs.push({ id: doc.id, ...doc.data() }));

            // Sort: Order (ASC), then createdAt (DESC) fallback
            certs.sort((a, b) => {
                const orderA = a.order !== undefined ? a.order : 999;
                const orderB = b.order !== undefined ? b.order : 999;
                if (orderA !== orderB) return orderA - orderB;
                return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
            });

            certs.forEach((data, index) => {
                const col = document.createElement('div');
                col.className = 'col-lg-4 col-md-6 cert-item';
                col.setAttribute('data-aos', 'fade-up');
                col.dataset.id = data.id; // For Sortable

                col.innerHTML = `
                    <div class="cert-card shadow-sm h-100 border-0 rounded-4 overflow-hidden bg-white position-relative" style="background-color: var(--card-bg) !important;">
                        ${isAdmin ? `<div class="drag-handle position-absolute top-0 start-0 p-2 text-dark opacity-25" style="z-index: 11; cursor: grab;"><i class="fas fa-grip-vertical"></i></div>` : ''}
                        <div class="cert-media p-2" style="background: #f1f5f9; position: relative; cursor: pointer;" onclick="window.open('${data.image || '#'}', '_blank')">
                            ${data.image ? `
                                <img src="${data.image}" alt="${data.name}" class="w-100" style="object-fit: contain; max-height: 300px;">
                            ` : `
                                <div class="w-100 h-100 d-flex align-items-center justify-content-center" style="min-height: 200px;">
                                    <i class="fas fa-award text-primary display-4"></i>
                                </div>
                            `}
                        </div>
                        <div class="p-4">
                            <h6 class="mb-2 fw-bold" style="color: var(--text-main);">${data.name}</h6>
                            <p class="small text-muted mb-1"><i class="fas fa-university me-1"></i> ${data.organization}</p>
                            <p class="small text-muted mb-0"><i class="far fa-calendar-alt me-1"></i> ${data.date}</p>
                        </div>
                        ${isAdmin ? `
                        <div class="position-absolute top-0 end-0 p-3 d-flex gap-1" style="z-index: 10;">
                            <button class="btn btn-warning btn-sm rounded-circle shadow-sm" onclick="openEditCert('${data.id}')" title="แก้ไข"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-danger btn-sm rounded-circle shadow-sm" onclick="deleteItem('certificates', '${data.id}')" title="ลบ"><i class="fas fa-trash"></i></button>
                        </div>
                        ` : ''}
                    </div>
                `;
                container.appendChild(col);
            });

            window.refreshCertsVisibility();

            // Init Drag & Drop for Certificates
            if (isAdmin && typeof Sortable !== 'undefined' && certs.length > 0) {
                Sortable.create(container, {
                    animation: 150,
                    filter: ".btn, button, i, a, .category-badge",
                    preventOnFilter: false,
                    delay: 100,
                    delayOnTouchOnly: true,
                    touchStartThreshold: 5,
                    onEnd: function () {
                        const items = container.querySelectorAll('.cert-item');
                        const batch = db.batch();
                        items.forEach((el, i) => {
                            batch.update(db.collection('certificates').doc(el.dataset.id), { order: i });
                        });
                        batch.commit().then(() => showToast('จัดลำดับเกียรติบัตรเรียบร้อย', 'success'));
                    }
                });
            }
        });
    }

    function fetchSkills() {
        if (!db) return;

        // Fetch Hard Skills
        db.collection('skills').where('type', '==', 'hard').onSnapshot(snapshot => {
            const container = document.getElementById('hard-skills-container');
            const adminList = document.getElementById('admin-hard-skills-list');
            if (container) container.innerHTML = '';
            if (adminList) adminList.innerHTML = '';

            // Get data and sort on client-side to avoid Firestore Index requirement
            const skills = [];
            snapshot.forEach(doc => skills.push({ id: doc.id, ...doc.data() }));
            skills.sort((a, b) => b.level - a.level);

            skills.forEach(data => {
                const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

                // Render in Main UI
                if (container) {
                    const item = document.createElement('div');
                    item.className = 'skill-item mb-4';
                    item.innerHTML = `
                        <div class="d-flex justify-content-between mb-1">
                            <span class="fw-bold">${data.name}</span>
                            <span class="text-primary fw-bold">${data.level}%</span>
                        </div>
                        <div class="progress" style="height: 10px; border-radius: 10px; background: rgba(0,0,0,0.05); overflow: visible;">
                            <div class="progress-bar" role="progressbar" 
                                style="width: 0%; border-radius: 10px; background: var(--gradient-primary); transition: width 1.5s cubic-bezier(0.1, 0.5, 0.2, 1); box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);"
                                data-level="${data.level}">
                            </div>
                        </div>
                    `;
                    container.appendChild(item);

                    // Trigger animation after a small delay
                    setTimeout(() => {
                        const bar = item.querySelector('.progress-bar');
                        if (bar) bar.style.width = bar.getAttribute('data-level') + '%';
                    }, 100);
                }

                // Render in Admin Modal
                if (adminList && isAdmin) {
                    const col = document.createElement('div');
                    col.className = 'col-md-6';
                    col.innerHTML = `
                        <div class="admin-skill-card d-flex justify-content-between align-items-center p-3 rounded-4 bg-white border shadow-sm h-100">
                            <div class="d-flex align-items-center">
                                <div class="skill-icon-sm me-3 bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
                                    <i class="fas fa-code"></i>
                                </div>
                                <div>
                                    <div class="fw-bold text-dark mb-0">${data.name}</div>
                                    <div class="text-primary fw-bold" style="font-size: 0.75rem;">${data.level}% Proficiency</div>
                                </div>
                            </div>
                            <button class="btn btn-light text-danger btn-sm rounded-circle p-2 ms-2 hover-shadow" onclick="deleteItem('skills', '${data.id}')" title="ลบ">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    `;
                    adminList.appendChild(col);
                }
            });
        }, err => console.error("Error fetching hard skills:", err));

        // Fetch Soft Skills
        db.collection('skills').where('type', '==', 'soft').onSnapshot(snapshot => {
            const container = document.getElementById('soft-skills-container');
            const adminList = document.getElementById('admin-soft-skills-list');
            if (container) container.innerHTML = '';
            if (adminList) adminList.innerHTML = '';

            snapshot.forEach(doc => {
                const data = doc.data();
                const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

                // Render in Main UI
                if (container) {
                    const col = document.createElement('div');
                    col.className = 'col-6';
                    col.innerHTML = `
                        <div class="soft-skill-card h-100 p-3 rounded-4 border text-center" style="background: rgba(var(--primary-rgb), 0.05); border-color: rgba(var(--primary-rgb), 0.1) !important;">
                            <i class="fas fa-check-circle text-primary mb-2"></i>
                            <h6 class="mb-1 fw-bold">${data.name}</h6>
                            <small class="text-muted d-block">${data.level}</small>
                        </div>
                    `;
                    container.appendChild(col);
                }

                // Render in Admin Modal
                if (adminList && isAdmin) {
                    const col = document.createElement('div');
                    col.className = 'col-md-6';
                    col.innerHTML = `
                        <div class="admin-skill-card d-flex justify-content-between align-items-center p-3 rounded-4 bg-white border shadow-sm h-100">
                            <div class="d-flex align-items-center">
                                <div class="skill-icon-sm me-3 bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
                                    <i class="fas fa-heart"></i>
                                </div>
                                <div>
                                    <div class="fw-bold text-dark mb-0">${data.name}</div>
                                    <div class="text-info fw-bold" style="font-size: 0.75rem;">${data.level}</div>
                                </div>
                            </div>
                            <button class="btn btn-light text-danger btn-sm rounded-circle p-2 ms-2 hover-shadow" onclick="deleteItem('skills', '${doc.id}')" title="ลบ">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    `;
                    adminList.appendChild(col);
                }
            });
        }, err => console.error("Error fetching soft skills:", err));
    }

    function fetchNews() {
        const container = document.getElementById('news-container');
        if (!container) return;

        if (!db) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-5">ยังไม่ได้เชื่อมต่อฐานข้อมูลข่าวสาร</div>';
            return;
        }

        db.collection('news').onSnapshot(snapshot => {
            const items = [];
            snapshot.forEach(doc => {
                items.push({ id: doc.id, ...doc.data() });
            });

            // Sort by order
            items.sort((a, b) => (a.order || 0) - (b.order || 0));

            container.innerHTML = '';
            const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

            items.forEach((data, index) => {
                const col = document.createElement('div');
                col.className = 'col-lg-4 col-md-6 news-item-card';
                col.dataset.id = data.id;
                col.innerHTML = `
                    <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden position-relative" style="background-color: var(--card-bg) !important;">
                        ${isAdmin ? `<div class="drag-handle position-absolute top-0 start-0 p-2 text-muted" style="z-index: 11; cursor: grab;"><i class="fas fa-grip-vertical"></i></div>` : ''}
                        <div class="card-body p-4">
                            <span class="badge bg-soft-primary text-primary mb-3 px-3 py-2 rounded-pill">${data.category}</span>
                            <h5 class="fw-bold mb-3" style="color: var(--text-main);">${data.title}</h5>
                            <p class="text-muted small mb-4" style="line-height: 1.6;">${data.content}</p>
                            <div class="d-flex justify-content-between align-items-center border-top pt-3" style="border-color: rgba(0,0,0,0.05) !important;">
                                <small class="text-muted"><i class="far fa-clock me-1"></i> ${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'กำลังโหลด...'}</small>
                                ${isAdmin ? `
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-link text-warning p-0 me-2 text-decoration-none" onclick="openEditNews('${data.id}')"><i class="fas fa-edit me-1"></i>แก้ไข</button>
                                    <button class="btn btn-link text-danger p-0 text-decoration-none" onclick="deleteItem('news', '${data.id}')"><i class="fas fa-trash me-1"></i>ลบ</button>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(col);
            });

            window.refreshNewsVisibility();

            // Init Sortable for News
            if (isAdmin && typeof Sortable !== 'undefined') {
                Sortable.create(container, {
                    animation: 150,
                    handle: ".drag-handle",
                    onEnd: function () {
                        const newsItems = container.querySelectorAll('.news-item-card');
                        const batch = db.batch();
                        newsItems.forEach((el, i) => {
                            batch.update(db.collection('news').doc(el.dataset.id), { order: i });
                        });
                        batch.commit().then(() => showToast('อัปเดตลำดับข่าวสารเรียบร้อย', 'success'));
                    }
                });
            }

            if (typeof AOS !== 'undefined') AOS.refresh();
        });
    }

    function fetchGpax() {
        const targetElement = document.getElementById('gpax-value');
        if (!targetElement || !db) return;

        db.collection('settings').doc('stats').onSnapshot(doc => {
            if (doc.exists) {
                const val = doc.data().gpax || "0.00";
                targetElement.setAttribute('data-target', val);
                // Trigger counter animation
                animateSingleCounter(targetElement);
            }
        });
    }

    function animateSingleCounter(el) {
        const target = parseFloat(el.getAttribute('data-target'));
        let count = 0;
        const duration = 1500;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuad = t => t * (2 - t);
            const current = target * easeOutQuad(progress);

            el.innerText = current.toFixed(2);
            if (progress < 1) requestAnimationFrame(update);
            else el.innerText = target.toFixed(2);
        }
        requestAnimationFrame(update);
    }

    function fetchMessages() {
        const adminList = document.getElementById('admin-messages-list');
        if (!adminList || !db) return;

        db.collection('messages').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
            const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
            if (!isAdmin) return;

            adminList.innerHTML = '';
            if (snapshot.empty) {
                adminList.innerHTML = '<div class="col-12 text-center py-5 text-muted">ยังไม่มีข้อความส่งเข้ามา</div>';
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const date = data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleString('th-TH') : 'ไม่ระบุเวลา';
                const col = document.createElement('div');
                col.className = 'col-12';
                col.innerHTML = `
                    <div class="card border shadow-sm rounded-4 overflow-hidden mb-2">
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h6 class="fw-bold mb-0 text-primary">${data.name}</h6>
                                    <small class="text-muted"><i class="far fa-envelope me-1"></i>${data.email}</small>
                                </div>
                                <div class="text-end">
                                    <small class="text-muted d-block" style="font-size: 0.7rem;">${date}</small>
                                    <button class="btn btn-link text-danger p-0 mt-1" onclick="deleteItem('messages', '${doc.id}')" title="ลบข้อความ">
                                        <i class="fas fa-trash-alt small"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="bg-light p-2 rounded-3 small">
                                <div class="fw-bold text-dark mb-1" style="font-size: 0.8rem;">หัวข้อ: ${data.subject || 'ไม่ระบุ'}</div>
                                <div class="text-secondary" style="white-space: pre-wrap;">${data.message}</div>
                            </div>
                        </div>
                    </div>
                `;
                adminList.appendChild(col);
            });
        });
    }

    // --- Admin Add Data ---

    document.getElementById('newsForm')?.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!db) {
            Swal.fire('ผิดพลาด', 'ฐานข้อมูลไม่ได้เชื่อมต่อ', 'error');
            return;
        }
        const id = document.getElementById('newsId').value;
        const data = {
            title: document.getElementById('newsTitle').value,
            category: document.getElementById('newsCategory').value,
            content: document.getElementById('newsContent').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        Swal.fire({
            title: 'ยืนยันการบันทึกข้อมูลหรือไม่?',
            text: "ข้อมูลข่าวสารจะถูกอัปเดตลงในหน้าเว็บไซต์",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1e5622',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'บันทึกข้อมูล',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
            customClass: { popup: 'rounded-4' }
        }).then((result) => {
            if (result.isConfirmed) {
                if (id) {
                    db.collection('news').doc(id).update(data).then(() => finalizeNewsSubmit(this));
                } else {
                    // Get current count for order
                    db.collection('news').get().then(snap => {
                        db.collection('news').add({
                            ...data,
                            order: snap.size,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        }).then(() => finalizeNewsSubmit(this));
                    });
                }
            }
        });
    });

    function finalizeNewsSubmit(form) {
        bootstrap.Modal.getInstance(document.getElementById('addNewsModal')).hide();
        form.reset();
        document.getElementById('newsId').value = '';
        Swal.fire({
            title: 'บันทึกข่าวสารสำเร็จ',
            icon: 'success',
            confirmButtonColor: '#1e5622',
            customClass: { title: 'text-success fw-bold', popup: 'rounded-4' }
        });
    }

    document.getElementById('projectForm')?.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!db) {
            alert("ฐานข้อมูลไม่ได้เชื่อมต่อ");
            return;
        }
        const id = document.getElementById('projId').value;
        const data = {
            type: document.getElementById('projType').value,
            title: document.getElementById('projTitle').value,
            category: document.getElementById('projCategory').value,
            role: document.getElementById('projRole').value,
            date: document.getElementById('projDate').value,
            location: document.getElementById('projLocation').value,
            image: document.getElementById('projImg').value,
            link: document.getElementById('projLink').value || '',
            description: document.getElementById('projDesc').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const projectsRef = db.collection('projects');

        Swal.fire({
            title: 'ยืนยันการบันทึกโครงการหรือไม่?',
            text: "ข้อมูลโครงการ/กิจกรรมจะถูกบันทึกสู่ฐานข้อมูล",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1e5622',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'บันทึกข้อมูล',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
            customClass: { popup: 'rounded-4' }
        }).then((result) => {
            if (result.isConfirmed) {
                if (id) {
                    projectsRef.doc(id).update(data).then(() => {
                        finalizeProjectSubmit(true);
                    });
                } else {
                    projectsRef.get().then(snap => {
                        const maxOrder = snap.empty ? 0 : Math.max(...snap.docs.map(d => d.data().order || 0));
                        projectsRef.add({
                            ...data,
                            order: maxOrder + 1,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        }).then(() => {
                            finalizeProjectSubmit(false);
                        });
                    });
                }
            }
        });

        function finalizeProjectSubmit(isEdit) {
            bootstrap.Modal.getInstance(document.getElementById('addProjectModal')).hide();
            document.getElementById('projectForm').reset();
            document.getElementById('projId').value = '';
            Swal.fire({
                title: isEdit ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ',
                icon: 'success',
                confirmButtonColor: '#1e5622',
                customClass: { title: 'text-success fw-bold', popup: 'rounded-4' }
            });
        }
    });

    document.getElementById('certForm')?.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!db) {
            alert("ฐานข้อมูลไม่ได้เชื่อมต่อ");
            return;
        }
        const id = document.getElementById('certId').value;
        const data = {
            name: document.getElementById('certName').value,
            organization: document.getElementById('certOrg').value,
            date: document.getElementById('certDate').value,
            image: document.getElementById('certImg').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const certsRef = db.collection('certificates');

        Swal.fire({
            title: 'ยืนยันเพิ่มเกียรติบัตรหรือไม่?',
            text: "เกียรติบัตรจะปรากฏบนผลงานของคุณ",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1e5622',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'บันทึกข้อมูล',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
            customClass: { popup: 'rounded-4' }
        }).then((result) => {
            if (result.isConfirmed) {
                if (id) {
                    certsRef.doc(id).update(data).then(() => {
                        finalizeCertSubmit(true);
                    });
                } else {
                    certsRef.get().then(snap => {
                        const maxOrder = snap.empty ? 0 : Math.max(...snap.docs.map(d => d.data().order || 0));
                        certsRef.add({
                            ...data,
                            order: maxOrder + 1,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        }).then(() => {
                            finalizeCertSubmit(false);
                        });
                    });
                }
            }
        });

        function finalizeCertSubmit(isEdit) {
            bootstrap.Modal.getInstance(document.getElementById('addCertModal')).hide();
            document.getElementById('certForm').reset();
            document.getElementById('certId').value = '';
            Swal.fire({
                title: isEdit ? 'แก้ไขเกียรติบัตรสำเร็จ' : 'เพิ่มเกียรติบัตรสำเร็จ',
                icon: 'success',
                confirmButtonColor: '#1e5622',
                customClass: { title: 'text-success fw-bold', popup: 'rounded-4' }
            });
        }
    });

    window.openEditNews = (id) => {
        db.collection('news').doc(id).get().then(doc => {
            const data = doc.data();
            document.getElementById('newsId').value = id;
            document.getElementById('newsTitle').value = data.title;
            document.getElementById('newsCategory').value = data.category;
            document.getElementById('newsContent').value = data.content;
            new bootstrap.Modal(document.getElementById('addNewsModal')).show();
        });
    };

    window.openEditProject = (id) => {
        db.collection('projects').doc(id).get().then(doc => {
            const data = doc.data();
            document.getElementById('projId').value = id;
            document.getElementById('projType').value = data.type || 'project';
            document.getElementById('projTitle').value = data.title;
            document.getElementById('projCategory').value = data.category;
            document.getElementById('projRole').value = data.role;
            document.getElementById('projDate').value = data.date || '';
            document.getElementById('projLocation').value = data.location || '';
            document.getElementById('projImg').value = data.image;
            document.getElementById('projLink').value = data.link || '';
            document.getElementById('projDesc').value = data.description;
            new bootstrap.Modal(document.getElementById('addProjectModal')).show();
        });
    };

    window.openEditCert = (id) => {
        db.collection('certificates').doc(id).get().then(doc => {
            const data = doc.data();
            document.getElementById('certId').value = id;
            document.getElementById('certName').value = data.name;
            document.getElementById('certOrg').value = data.organization;
            document.getElementById('certDate').value = data.date;
            document.getElementById('certImg').value = data.image || '';
            new bootstrap.Modal(document.getElementById('addCertModal')).show();
        });
    };

    window.viewProjectDetail = (id) => {
        if (!db) return;
        db.collection('projects').doc(id).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                const content = document.getElementById('project-detail-content');
                const categoryNames = {
                    'academic': 'ด้านวิชาการ',
                    'innovation': 'ทักษะ & นวัตกรรม',
                    'volunteer': 'ด้านจิตอาสา',
                    'leadership': 'ด้านความเป็นผู้นำ',
                    'others': 'ด้านอื่น ๆ'
                };
                const displayCategory = categoryNames[data.category] || data.category;

                if (content) {
                    content.innerHTML = `
                        <div class="row">
                            <div class="col-md-6 mb-4 mb-md-0">
                                <img src="${data.image}" class="img-fluid rounded-4 shadow-sm" alt="${data.title}">
                            </div>
                            <div class="col-md-6">
                                <span class="badge bg-soft-primary text-primary mb-3 px-3 py-2 rounded-pill">${displayCategory}</span>
                                <h3 class="fw-bold mb-3">${data.title}</h3>
                                ${data.role ? `
                                <div class="mb-3">
                                    <h6 class="fw-bold text-primary mb-1"><i class="fas fa-user-tag me-2"></i>บทบาท</h6>
                                    <p class="text-muted small">${data.role}</p>
                                </div>` : ''}
                                <div class="row mb-3">
                                    <div class="col-6">
                                        <h6 class="fw-bold text-primary mb-1"><i class="far fa-calendar-alt me-2"></i>วันที่</h6>
                                        <p class="text-muted small">${data.date || '-'}</p>
                                    </div>
                                    ${data.location ? `
                                    <div class="col-6">
                                        <h6 class="fw-bold text-primary mb-1"><i class="fas fa-map-marker-alt me-2"></i>สถานที่</h6>
                                        <p class="text-muted small">${data.location}</p>
                                    </div>` : ''}
                                </div>
                                <div>
                                    <h6 class="fw-bold text-primary mb-1"><i class="fas fa-info-circle me-2"></i>รายละเอียดเพิ่มเติม</h6>
                                    <p class="text-muted small mb-3" style="white-space: pre-wrap;">${data.description}</p>
                                    ${data.link ? `
                                        <a href="${data.link}" target="_blank" class="btn btn-primary-gradient rounded-pill px-4 btn-sm fw-bold w-100">
                                            <i class="fas fa-external-link-alt me-2"></i>เข้าชมเว็บไซต์ / ลิงก์ผลงาน
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                    new bootstrap.Modal(document.getElementById('projectDetailModal')).show();
                }
            }
        });
    };

    // Skills Form Submits
    document.getElementById('hardSkillForm')?.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!db) return;
        const name = document.getElementById('hSkillName').value;
        const level = parseInt(document.getElementById('hSkillLevel').value);

        Swal.fire({
            title: 'ยืนยันเพิ่มทักษะหรือไม่?',
            text: `ต้องการเพิ่มทักษะ ${name} ใช่หรือไม่?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1e5622',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'เพิ่มทักษะ',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
            customClass: { popup: 'rounded-4' }
        }).then((result) => {
            if (result.isConfirmed) {
                db.collection('skills').add({
                    name, level, type: 'hard', createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    this.reset();
                    Swal.fire({
                        title: 'เพิ่มทักษะสำเร็จ',
                        icon: 'success',
                        confirmButtonColor: '#1e5622',
                        customClass: { title: 'text-success fw-bold', popup: 'rounded-4' }
                    });
                });
            }
        });
    });

    document.getElementById('softSkillForm')?.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!db) return;
        const name = document.getElementById('sSkillName').value;
        const level = document.getElementById('sSkillLevel').value;

        Swal.fire({
            title: 'ยืนยันเพิ่มทักษะหรือไม่?',
            text: `ต้องการเพิ่มทักษะ ${name} ใช่หรือไม่?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1e5622',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'เพิ่มทักษะ',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
            customClass: { popup: 'rounded-4' }
        }).then((result) => {
            if (result.isConfirmed) {
                db.collection('skills').add({
                    name, level, type: 'soft', createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    this.reset();
                    Swal.fire({
                        title: 'เพิ่มทักษะสำเร็จ',
                        icon: 'success',
                        confirmButtonColor: '#1e5622',
                        customClass: { title: 'text-success fw-bold', popup: 'rounded-4' }
                    });
                });
            }
        });
    });

    document.getElementById('gpaxForm')?.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!db) return;

        const s1 = parseFloat(document.getElementById('sem1').value) || 0;
        const s2 = parseFloat(document.getElementById('sem2').value) || 0;
        const s3 = parseFloat(document.getElementById('sem3').value) || 0;
        const s4 = parseFloat(document.getElementById('sem4').value) || 0;
        const s5 = parseFloat(document.getElementById('sem5').value) || 0;

        const average = (s1 + s2 + s3 + s4 + s5) / 5;

        Swal.fire({
            title: 'ยืนยันบันทึกผลการเรียน?',
            text: `GPAX สะสมของปีการศึกษาจะถูกอัปเดตเป็น ${average.toFixed(2)}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1e5622',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'บันทึกข้อมูล',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
            customClass: { popup: 'rounded-4' }
        }).then((result) => {
            if (result.isConfirmed) {
                db.collection('settings').doc('stats').set({
                    gpax: average.toFixed(2),
                    semesters: { s1, s2, s3, s4, s5 }
                }, { merge: true }).then(() => {
                    bootstrap.Modal.getInstance(document.getElementById('editGpaxModal')).hide();
                    Swal.fire({
                        title: 'บันทึกผลการเรียนสำเร็จ',
                        icon: 'success',
                        confirmButtonColor: '#1e5622',
                        customClass: { title: 'text-success fw-bold', popup: 'rounded-4' }
                    });
                });
            }
        });
    });

    // Real-time calculation for GPAX modal
    document.querySelectorAll('.sem-input').forEach(input => {
        input.addEventListener('input', () => {
            const inputs = document.querySelectorAll('.sem-input');
            let total = 0;
            inputs.forEach(i => total += parseFloat(i.value) || 0);
            const avg = total / 5;
            const display = document.getElementById('calculatedGpax');
            if (display) display.innerText = avg.toFixed(2);
        });
    });

    // Prefill GPAX form when modal opens
    document.getElementById('editGpaxModal')?.addEventListener('show.bs.modal', () => {
        if (!db) return;
        db.collection('settings').doc('stats').get().then(doc => {
            if (doc.exists && doc.data().semesters) {
                const s = doc.data().semesters;
                document.getElementById('sem1').value = s.s1 || '';
                document.getElementById('sem2').value = s.s2 || '';
                document.getElementById('sem3').value = s.s3 || '';
                document.getElementById('sem4').value = s.s4 || '';
                document.getElementById('sem5').value = s.s5 || '';

                const avg = (parseFloat(s.s1 || 0) + parseFloat(s.s2 || 0) + parseFloat(s.s3 || 0) + parseFloat(s.s4 || 0) + parseFloat(s.s5 || 0)) / 5;
                document.getElementById('calculatedGpax').innerText = avg.toFixed(2);
            }
        });
    });

    window.deleteItem = (collection, id) => {
        if (!db) {
            Swal.fire('ผิดพลาด', 'ฐานข้อมูลไม่ได้เชื่อมต่อ', 'error');
            return;
        }
        Swal.fire({
            title: 'ยืนยันการลบข้อมูล?',
            text: "ข้อมูลนี้จะหายไปถาวรและไม่สามารถกู้คืนได้",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'ยืนยันการลบ',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
            customClass: {
                title: 'fw-bold',
                popup: 'rounded-4'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                db.collection(collection).doc(id).delete().then(() => {
                    Swal.fire({
                        title: 'ลบข้อมูลสำเร็จ',
                        icon: 'success',
                        confirmButtonColor: '#1e5622',
                        customClass: {
                            title: 'text-success fw-bold',
                            popup: 'rounded-4'
                        }
                    });
                });
            }
        });
    };

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-success' : 'bg-danger';
        toast.className = `position-fixed bottom-0 start-50 translate-middle-x mb-5 p-3 ${bgColor} text-white rounded-3 shadow-lg`;
        toast.style.zIndex = '10000';
        toast.innerHTML = `<i class="fas fa-info-circle me-2"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // --- Contact Form Logic ---
    document.getElementById('contactForm')?.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!db) {
            showToast('ฐานข้อมูลยังไม่พร้อมใช้งาน (Demo Mode)', 'danger');
            return;
        }

        const nameInput = document.getElementById('contactName');
        const emailInput = document.getElementById('contactEmail');
        const subjectInput = document.getElementById('contactSubject');
        const messageInput = document.getElementById('contactMessage');

        const data = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            subject: subjectInput.value.trim(),
            message: messageInput.value.trim(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (!data.name || !data.email || !data.message) {
            showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'danger');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // UI Feedback
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>กำลังส่งข้อมูล...';

        db.collection('messages').add(data)
            .then(() => {
                showToast('ส่งข้อความสำเร็จ! ขอบคุณที่ติดต่อเรา', 'success');
                this.reset();
            })
            .catch(err => {
                console.error("Firebase Error:", err);
                showToast('ไม่สามารถส่งข้อความได้ในขณะนี้: ' + err.message, 'danger');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            });
    });

    // --- UI Effects ---

    // Parallax (Only on non-touch devices for better performance/UX)
    const profileImgWrap = document.querySelector('.profile-img-wrapper');
    if (profileImgWrap && !('ontouchstart' in window)) {
        document.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const x = (clientX - window.innerWidth / 2) / 60;
            const y = (clientY - window.innerHeight / 2) / 60;
            profileImgWrap.style.transform = `rotateX(${-y}deg) rotateY(${x}deg)`;
        });
    }

    // Auto-close mobile menu on click
    const navItems = document.querySelectorAll('.navbar-nav .nav-link:not([data-bs-toggle])');
    const menuToggle = document.getElementById('navbarNav');
    if (menuToggle) {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const bsCollapse = bootstrap.Collapse.getInstance(menuToggle);
                if (bsCollapse) bsCollapse.hide();
            });
        });
    }

    // Scroll Spy
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (window.pageYOffset >= section.offsetTop - 150) current = section.getAttribute('id');
        });
        navLinks.forEach(link => {
            link.classList.remove('active', 'text-primary');
            if (link.getAttribute('href') === `#${current}`) link.classList.add('active', 'text-primary');
        });
    });

    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeUI(newTheme);
        });
    }

    // Navbar & Scroll Bar
    const navbar = document.querySelector('.navbar');
    const scrollBar = document.getElementById('scrollBar');
    window.addEventListener('scroll', () => {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollBar) scrollBar.style.width = scrolled + "%";

        if (window.scrollY > 50) {
            navbar.classList.add('scrolled', 'shadow');
        } else {
            navbar.classList.remove('scrolled', 'shadow');
        }
    });

    function bindFilterLogic() {
        // Handled by window.applyProjectFilter and inline onclick
    }

    // Counters
    const counters = document.querySelectorAll('.counter');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseFloat(entry.target.getAttribute('data-target'));
                let count = 0;
                const i = setInterval(() => {
                    count += target / 50;
                    if (count >= target) {
                        entry.target.innerText = target.toString().includes('.') ? target.toFixed(2) : Math.round(target);
                        clearInterval(i);
                    } else {
                        entry.target.innerText = target.toString().includes('.') ? count.toFixed(2) : Math.round(count);
                    }
                }, 40);
                observer.unobserve(entry.target);
            }
        });
    });
    counters.forEach(c => observer.observe(c));

    // Typed.js
    const typingElement = document.getElementById('typing-text');
    if (typingElement && typeof Typed !== 'undefined') {
        new Typed('#typing-text', {
            strings: ['นักเรียน (Student)', 'นักพัฒนา (Developer)'],
            typeSpeed: 60, backSpeed: 40, loop: true
        });
    }

    // AOS
    if (typeof AOS !== 'undefined') AOS.init({ duration: 1000, once: true });

    window.refreshProjectVisibility = function () {
        ['project', 'activity'].forEach(type => {
            const containerId = type === 'project' ? 'projects-container' : 'activities-container';
            const btnId = type === 'project' ? 'show-more-projects' : 'show-more-activities';
            const btn = document.getElementById(btnId);
            const isExpanded = btn?.dataset.expanded === "true";
            const items = document.querySelectorAll(`#${containerId} .project-item`);

            let matchedCount = 0;
            items.forEach(item => {
                const matchesFilter = window.currentProjectFilter === 'all' || item.classList.contains(window.currentProjectFilter);
                if (matchesFilter) {
                    matchedCount++;
                    item.style.display = 'block'; // Ensure it's not hidden by previous filter style

                    // Logic for pagination class 'more-X' and 'd-none'
                    item.classList.remove(`more-${type}`);
                    if (matchedCount > 6) {
                        item.classList.add(`more-${type}`);
                        item.classList.toggle('d-none', !isExpanded);
                    } else {
                        item.classList.remove('d-none');
                    }
                } else {
                    item.style.display = 'none';
                    item.classList.remove('d-none'); // d-none is for pagination, display is for filter
                }
            });

            if (btn) {
                btn.parentElement.classList.toggle('d-none', matchedCount <= 6);
                if (matchedCount <= 6) {
                    btn.dataset.expanded = "false";
                    btn.innerHTML = 'ดูเพิ่มเติม <i class="fas fa-chevron-down ms-2"></i>';
                }
            }
        });
        if (typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 100);
    };

    window.toggleShowMoreBtn = function (type, show) {
        const btn = document.getElementById(`show-more-${type}`);
        if (btn) {
            btn.parentElement.classList.toggle('d-none', !show);
            if (!show) {
                btn.innerHTML = 'ดูเพิ่มเติม <i class="fas fa-chevron-down ms-2"></i>';
                btn.dataset.expanded = "false";
            }
        }
    };

    window.refreshCertsVisibility = function () {
        const btn = document.getElementById('show-more-certs');
        const isExpanded = btn?.dataset.expanded === "true";
        const items = document.querySelectorAll('#cert-container .cert-item');

        items.forEach((item, index) => {
            if (index >= 6) {
                item.classList.add('more-cert');
                item.classList.toggle('d-none', !isExpanded);
            } else {
                item.classList.remove('more-cert', 'd-none');
            }
        });

        if (btn) {
            btn.parentElement.classList.toggle('d-none', items.length <= 6);
            if (items.length <= 6) {
                btn.dataset.expanded = "false";
                btn.innerHTML = 'ดูเพิ่มเติม <i class="fas fa-chevron-down ms-2"></i>';
            }
        }
        if (typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 100);
    };

    window.refreshNewsVisibility = function () {
        const btn = document.getElementById('show-more-news');
        const isExpanded = btn?.dataset.expanded === "true";
        const items = document.querySelectorAll('#news-container .news-item-card');

        items.forEach((item, index) => {
            if (index >= 6) {
                item.classList.add('more-news');
                item.classList.toggle('d-none', !isExpanded);
            } else {
                item.classList.remove('more-news', 'd-none');
            }
        });

        if (btn) {
            btn.parentElement.classList.toggle('d-none', items.length <= 6);
            if (items.length <= 6) {
                btn.dataset.expanded = "false";
                btn.innerHTML = 'ดูเพิ่มเติม <i class="fas fa-chevron-down ms-2"></i>';
            }
        }
        if (typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 100);
    };

    window.toggleItems = function (type) {
        const btn = document.getElementById(`show-more-${type}`);
        if (!btn) return;

        const isExpanded = btn.dataset.expanded === "true";
        const newExpanded = !isExpanded;

        btn.dataset.expanded = newExpanded.toString();
        btn.innerHTML = newExpanded ? 'แสดงน้อยลง <i class="fas fa-chevron-up ms-2"></i>' : 'ดูเพิ่มเติม <i class="fas fa-chevron-down ms-2"></i>';

        if (type === 'projects' || type === 'activities') {
            window.refreshProjectVisibility();
        } else if (type === 'certs') {
            window.refreshCertsVisibility();
        } else if (type === 'news') {
            window.refreshNewsVisibility();
        }

        if (!newExpanded) {
            const section = btn.closest('section');
            if (section) window.scrollTo({ top: section.offsetTop - 80, behavior: 'smooth' });
        }
        if (typeof AOS !== 'undefined') AOS.refresh();
    };

    // Dynamic Age Calculation
    function updateDynamicAge() {
        const ageElements = document.querySelectorAll('.dynamic-age');
        if (ageElements.length === 0) return;

        // Birthday: March 20, 2011 (based on previous user edit)
        const birthDate = new Date(2011, 2, 20, 0, 0, 0);

        setInterval(() => {
            const now = new Date();

            let years = now.getFullYear() - birthDate.getFullYear();
            let months = now.getMonth() - birthDate.getMonth();
            let days = now.getDate() - birthDate.getDate();
            let hours = now.getHours() - birthDate.getHours();
            let minutes = now.getMinutes() - birthDate.getMinutes();
            let seconds = now.getSeconds() - birthDate.getSeconds();

            if (seconds < 0) { seconds += 60; minutes--; }
            if (minutes < 0) { minutes += 60; hours--; }
            if (hours < 0) { hours += 24; days--; }

            if (days < 0) {
                const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                days += lastMonth.getDate();
                months--;
            }
            if (months < 0) {
                months += 12;
                years--;
            }

            const ageFull = `
                <div class="d-flex flex-wrap gap-1" style="font-size: 0.8rem; line-height: 1.2;">
                    <span>${years}ปี</span>
                    <span>${months}ด.</span>
                    <span>${days}ว.</span>
                    <span>${hours}ชม.</span>
                    <span>${minutes}น.</span>
                    <span>${seconds}ว.</span>
                </div>
            `;

            const ageSimple = `${years} ปี ${months} เดือน ${days} วัน ${hours} ชม. ${minutes} น. ${seconds} ว.`;

            ageElements.forEach(el => {
                if (el.classList.contains('age-simple')) {
                    if (el.innerHTML !== ageSimple) el.innerHTML = ageSimple;
                } else {
                    if (el.innerHTML !== ageFull) el.innerHTML = ageFull;
                }
            });
        }, 1000);
    }

    updateDynamicAge();
});

window.applyProjectFilter = function (filter) {
    window.currentProjectFilter = filter;
    const btns = document.querySelectorAll('.filter-btns .btn');
    btns.forEach(b => {
        if (b.getAttribute('data-filter') === filter) b.classList.add('active');
        else b.classList.remove('active');
    });

    window.refreshProjectVisibility();
};

window.filterByCategory = function (category) {
    window.applyProjectFilter(category);
    const section = document.getElementById('experience');
    if (section) {
        const offset = section.offsetTop - 100;
        window.scrollTo({ top: offset, behavior: 'smooth' });
    }
};
