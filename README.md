# 🌟 Pooh-Portfolio | Thanakorn Sae-jong

![Pooh-Portfolio Banner](https://img.shields.io/badge/Status-Premium-gold?style=for-the-badge&logo=github)
![Version](https://img.shields.io/badge/Version-2.0-blue?style=for-the-badge)
![Tech](https://img.shields.io/badge/Tech-Firebase_|_Bootstrap_5-orange?style=for-the-badge&logo=firebase)

เว็บไซต์แฟ้มสะสมผลงาน (Digital Portfolio) ส่วนตัวของ **นายธนากร แซ่จอง (พูห์)** ที่ออกแบบมาเพื่อนำเสนอทักษะ ประวัติการศึกษา และผลงานในรูปแบบที่ทันสมัย (Premium & Modern Design) พร้อมระบบจัดการข้อมูลหลังบ้าน (Admin Panel)

---

## ✨ คุณสมบัติเด่น (Main Features)

- 🎨 **Modern & Premium UI:** ดีไซน์ที่เน้นความสวยงาม ใช้สีสันแบบ Gradient และระบบ Glassmorphism
- 🌓 **Dark/Light Mode:** รองรับการปรับโหมดมืดและโหมดสว่างตามความต้องการของผู้ใช้
- 📱 **Fully Responsive:** แสดงผลได้อย่างสมบูรณ์แบบในทุกอุปกรณ์ (Mobile, Tablet, Desktop)
- 🚀 **Performance Optimized:** โหลดเร็วด้วยการใช้ CDN และการเขียนโค้ดที่สะอาด
- 🛠️ **Admin Dashboard:** ระบบหลังบ้านสำหรับจัดการ ข่าวสาร, บทความ และข้อความติดต่อ โดยใช้ Firebase
- 📊 **Dynamic Content:** ข้อมูลบางส่วนดึงมาจาก Firestore ทำให้สามารถอัปเดตได้แบบ Real-time
- 🎭 **AOS Animations:** เพิ่มความลื่นไหลด้วยอนิเมชั่นตอนเลื่อนหน้าจอ (Animate on Scroll)

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### **Frontend**
- **HTML5 & CSS3:** โครงสร้างพื้นฐานและการตกแต่งแบบกำหนดเอง
- **Bootstrap 5:** เฟรมเวิร์กหลักสำหรับการจัด Layout และ Component
- **JavaScript (ES6+):** การจัดการ Logic และความลื่นไหลของเว็บไซต์
- **Google Fonts (Kanit):** ฟอนต์ภาษาไทยที่ทันสมัยและอ่านง่าย

### **Libraries & Icons**
- **AOS (Animate On Scroll):** ระบบอนิเมชั่นเมื่อเลื่อนหน้าจอ
- **Typed.js:** เอฟเฟกต์การพิมพ์ข้อความอัตโนมัติ
- **Font Awesome 6:** ไอคอนคุณภาพสูงสำหรับส่วนประกอบต่างๆ
- **Icons8:** โลโก้แบรนด์เทคโนโลยีที่สวยงาม

### **Backend & Database**
- **Firebase App:** แพลตฟอร์มหลักสำหรับการทำงานเบื้องหลัง
- **Firestore Database:** ฐานข้อมูลแบบ NoSQL สำหรับเก็บข้อมูลแบบ Dynamic
- **Firebase Auth:** ระบบยืนยันตัวตนสำหรับ Admin
- **Firebase Hosting:** ระบบโฮสติ้งที่รวดเร็วและปลอดภัย

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
Pooh-Portfolio/
├── css/                # ไฟล์สไตล์ (Custom CSS)
├── js/                 # ไฟล์ Logic (Main JS, Firebase Integration)
├── img/                # ไฟล์รูปภาพ (Profile, Logos, Assets)
├── index.html          # หน้าหลักของเว็บไซต์ (Home Page)
├── aboutme.html        # หน้าข้อมูลส่วนตัวโดยละเอียด
├── firebase.json       # ไฟล์การตั้งค่า Firebase Hosting
└── package.json        # ข้อมูลโปรเจกต์และ Dependencies
```

---

## 🚀 การติดตั้งและใช้งาน (Setup & Installation)

1. **Clone โปรเจกต์:**
   ```bash
   git clone https://github.com/Pooh191/Pooh-Portfolio.git
   ```

2. **ตั้งค่า Firebase:**
   - สร้างโปรเจกต์บน [Firebase Console](https://console.firebase.google.com/)
   - เปิดใช้งาน Firestore Database และ Authentication
   - นำ Config ของคุณไปใส่ในไฟล์ `js/main.js`

3. **รันบนเครื่อง:**
   - คุณสามารถใช้ **Live Server** บน VS Code หรือเปิดไฟล์ `index.html` โดยตรง

4. **การ Deploy:**
   ```bash
   firebase deploy
   ```

---

## 👨‍💻 พัฒนาโดย (Developed By)

**นายธนากร แซ่จอง (พูห์)**
- **Facebook:** [Thanakorn Sae-jong](https://www.facebook.com/thanakorn.sae.jong.2024)
- **Instagram:** [@thanakornsaejong6](https://www.instagram.com/thanakornsaejong6/)
- **GitHub:** [Pooh191](https://github.com/Pooh191)

---

> [!NOTE]
> โปรเจกต์นี้ได้รับการพัฒนาขึ้นเพื่อใช้เป็น Portfolio ในการยื่นเข้าศึกษาต่อระดับมหาวิทยาลัย และเพื่อแสดงศักยภาพด้านการพัฒนาเว็บแอปพลิเคชัน
