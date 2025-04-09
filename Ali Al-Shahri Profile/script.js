// تأثير الكتابة
const texts = ["programmer", "Web Developer", "Bug Hunter", 'Arduino Engineer'];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingDelay = 200;

function type() {
    const typingText = document.getElementById('typing');
    if (!typingText) return; // تأكد من وجود العنصر

    const currentText = texts[textIndex];
    
    if (isDeleting) {
        typingText.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typingDelay = 100;
    } else {
        typingText.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        typingDelay = 200;
    }
    
    if (!isDeleting && charIndex === currentText.length) {
        typingDelay = 1500;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        typingDelay = 500;
    }
    
    setTimeout(type, typingDelay);
}

// تحسين وظيفة القائمة المنسدلة
function toggleDropdown() {
    const dropdown = document.querySelector('.dropdown');
    const hamburg = document.querySelector('.hamburg');
    const cancel = document.querySelector('.cancel');
    
    if (!dropdown || !hamburg || !cancel) return; // تأكد من وجود العناصر
    
    dropdown.classList.toggle('active');
    hamburg.style.opacity = dropdown.classList.contains('active') ? '0' : '1';
    cancel.style.opacity = dropdown.classList.contains('active') ? '1' : '0';
    hamburg.style.pointerEvents = dropdown.classList.contains('active') ? 'none' : 'all';
    cancel.style.pointerEvents = dropdown.classList.contains('active') ? 'all' : 'none';
    
    // منع التمرير عندما تكون القائمة مفتوحة
    document.body.style.overflow = dropdown.classList.contains('active') ? 'hidden' : '';
}

// إضافة مستمع لحدث تغيير حجم النافذة
window.addEventListener('resize', function() {
    const dropdown = document.querySelector('.dropdown');
    if (window.innerWidth > 991 && dropdown.classList.contains('active')) {
        dropdown.classList.remove('active');
        document.body.style.overflow = '';
        document.querySelector('.hamburg').style.opacity = '1';
        document.querySelector('.cancel').style.opacity = '0';
    }
});

// إغلاق القائمة عند النقر على الروابط
document.addEventListener('DOMContentLoaded', function() {
    // بدء تأثير الكتابة
    setTimeout(type, 1000);
    
    // إضافة سلوك سلس للتمرير
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});