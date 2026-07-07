# Note-Player-SC-

เว็บแอปบันทึกข้อมูลผู้เล่น (ชื่อ / เผ่า / กลยุทธ์ / มารยาท) โดยเก็บข้อมูลลง Google Sheet ที่อยู่ใน Google Drive โฟลเดอร์ `Note-Player-SC-` ผ่าน Google Apps Script Web App เป็น backend และแสดงผลผ่านหน้าเว็บที่ host บน GitHub Pages

## โครงสร้างไฟล์

- `index.html`, `style.css`, `app.js` — หน้าเว็บ (form กรอกข้อมูล + ตารางแสดงรายการที่บันทึกไว้ + gate รหัสผ่าน)
- `apps-script/Code.gs` — โค้ด backend ที่ต้อง copy ไปวางใน Google Apps Script (ไม่ได้ deploy จากตรงนี้ ต้องทำเองใน Google)

## ขั้นตอนตั้งค่า (ทำครั้งเดียว)

### 1. สร้างโฟลเดอร์และ Sheet ใน Google Drive

1. เปิด [Google Drive](https://drive.google.com) แล้วสร้างโฟลเดอร์ชื่อ `Note-Player-SC-`
2. ในโฟลเดอร์นั้น สร้าง Google Sheet ใหม่ ตั้งชื่อว่า `NotePlayerData` (จะสร้างชีตชื่ออื่นก็ได้ แต่ต้องแก้ `SHEET_NAME` ใน `Code.gs` ให้ตรงกัน)
3. ไม่ต้องใส่หัวตาราง (header) เอง — สคริปต์จะสร้าง header แถวแรกให้อัตโนมัติเมื่อรันครั้งแรก

### 2. ผูก Apps Script เข้ากับ Sheet

1. เปิด Sheet ที่สร้างไว้ แล้วไปที่เมนู **Extensions > Apps Script**
2. ลบโค้ดตัวอย่างที่มีอยู่ทั้งหมด แล้ววางเนื้อหาไฟล์ [`apps-script/Code.gs`](apps-script/Code.gs) ลงไปแทน
3. กด Save (ไอคอนแผ่นดิสก์)

### 3. Deploy เป็น Web App

1. ที่มุมขวาบนของ Apps Script editor กด **Deploy > New deployment**
2. เลือกประเภท (gear icon) เป็น **Web app**
3. ตั้งค่า:
   - **Execute as**: Me (บัญชี Google ของคุณ)
   - **Who has access**: Anyone
4. กด **Deploy** แล้วอนุญาตสิทธิ์ (authorize) ตามที่ Google ถามครั้งแรก
5. คัดลอก **Web app URL** ที่ได้ (รูปแบบ `https://script.google.com/macros/s/XXXXX/exec`)

> ถ้าแก้โค้ดใน `Code.gs` ภายหลัง ต้องทำ **Deploy > Manage deployments > แก้ไข (แก้ version เป็น New version) > Deploy** ใหม่ทุกครั้ง ไม่งั้น URL เดิมจะยังใช้โค้ดเวอร์ชันเก่า

### 4. ใส่ URL ลงในเว็บแอป

เปิดไฟล์ [`app.js`](app.js) แล้วแก้บรรทัด:

```js
APPS_SCRIPT_URL: "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE",
```

ให้เป็น URL ที่คัดลอกมาจากขั้นตอนที่ 3 แล้ว commit + push ขึ้น GitHub

### 5. เปิดใช้งาน GitHub Pages

1. ไปที่ repo บน GitHub > **Settings > Pages**
2. Source เลือก branch `main`, folder `/ (root)`
3. บันทึก แล้วรอสักครู่ เว็บจะพร้อมใช้งานที่ `https://<username>.github.io/Note-Player-SC-/`

## รหัสผ่านหน้า Gate

หน้าเว็บมีหน้ากั้นด้วยรหัสผ่านง่ายๆ (กันคนนอกเข้ามาเห็น/กรอกข้อมูลเล่นๆ — **ไม่ใช่ระบบความปลอดภัยจริงจัง** เพราะเป็นเว็บ static ฝั่ง client ล้วนๆ)

- รหัสผ่านเริ่มต้นคือ **`noteplayer2026`**
- การเปลี่ยนรหัสผ่าน: เปิด browser console (กด F12) แล้วรันคำสั่งนี้เพื่อคำนวณ hash ของรหัสผ่านใหม่

  ```js
  crypto.subtle.digest("SHA-256", new TextEncoder().encode("รหัสผ่านใหม่ของคุณ"))
    .then(buf => console.log(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")));
  ```

  แล้วนำค่า hash ที่ได้ไปแทนที่ `PASSWORD_HASH` ใน [`app.js`](app.js)

## การทดสอบ

1. เปิด `index.html` ในเบราว์เซอร์ (หรือรันผ่าน local server) — ควรเจอหน้ากรอกรหัสผ่านก่อน
2. ใส่รหัสผ่าน `noteplayer2026` (หรือรหัสที่ตั้งใหม่) เพื่อเข้าหน้าฟอร์ม
3. หลังตั้งค่า `APPS_SCRIPT_URL` แล้ว ลองกรอกฟอร์มแล้วกด "บันทึกข้อมูล" — ควรขึ้นข้อความ "บันทึกข้อมูลสำเร็จ" และแถวใหม่ต้องไปโผล่ทั้งใน Google Sheet และในตารางบนหน้าเว็บ
