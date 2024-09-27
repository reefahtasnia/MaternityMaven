select * from users;
select * from passwords;
select * from Medical_History;
select * from orders;
select * from cart;
select * from products;
select * from medicine;
select * from MEDICINETRACKER;
select * from doctors;
select * from appointments;
select * from MedicalHistoryView;
SELECT * FROM USER_IMAGES;
SELECT * FROM doctor_images;
select * from admin;
select * from feedbacks;

drop table products;
drop TRIGGER medicine_trigger;

CREATE OR REPLACE TRIGGER medicine_trigger
BEFORE INSERT ON medicinetracker
FOR EACH ROW
BEGIN
    SELECT medicine_seq.NEXTVAL INTO :new.id FROM dual;
END;

ALTER TRIGGER C##ZAFIRA.MEDICINE_TRIGGER COMPILE;

SELECT * FROM user_errors WHERE type = 'TRIGGER' AND name = 'MEDICINE_TRIGGER';

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC011', 'DR. JAMES LEE', 'JAMES.LEE@EXAMPLE.COM', 'MALE', '1234567890', 'ORTHOPEDICS', 2012, 'HEALTHCARE HOSPITAL', 'SUITE 101', 2024-2012, 150, TO_DATE('1984-03-11', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC012', 'DR. LINDA BROWN', 'LINDA.BROWN@EXAMPLE.COM', 'FEMALE', '9876543210', 'PEDIATRICS', 2005, 'KIDS CARE CLINIC', 'PEDIATRICS WING', 2024-2005, 180, TO_DATE('1975-05-25', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC013', 'DR. MARK TAILOR', 'MARK.TAILOR@EXAMPLE.COM', 'MALE', '1928374650', 'DERMATOLOGY', 2000, 'SKIN SPECIALISTS', 'SUITE 205', 2024-2000, 230, TO_DATE('1970-07-20', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC014', 'DR. NORA ALLEN', 'NORA.ALLEN@EXAMPLE.COM', 'FEMALE', '5647382910', 'PSYCHIATRY', 2008, 'MIND & HEALTH', '2ND FLOOR', 2024-2008, 120, TO_DATE('1982-10-31', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC015', 'DR. OSCAR WILDE', 'OSCAR.WILDE@EXAMPLE.COM', 'MALE', '5839274650', 'NEUROLOGY', 1998, 'BRAIN CARE INSTITUTE', 'SUITE 303', 2024-1998, 300, TO_DATE('1968-12-15', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC016', 'DR. PAULA RIGHT', 'PAULA.RIGHT@EXAMPLE.COM', 'FEMALE', '6789456123', 'CARDIOLOGY', 2015, 'HEARTLINE MEDICAL', 'GROUND FLOOR', 2024-2015, 80, TO_DATE('1989-04-27', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC017', 'DR. QUENTIN COLD', 'QUENTIN.COLD@EXAMPLE.COM', 'MALE', '7594837261', 'EMERGENCY MEDICINE', 2018, 'QUICK CARE EMERGENCY', 'EMERGENCY ROOM', 2024-2018, 45, TO_DATE('1992-08-09', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC018', 'DR. RACHEL GREEN', 'RACHEL.GREEN@EXAMPLE.COM', 'FEMALE', '8253946172', 'ONCOLOGY', 2003, 'CANCER FREE CLINIC', 'ONCOLOGY DEPT', 2024-2003, 190, TO_DATE('1978-03-22', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC019', 'DR. STEVE JOBS', 'STEVE.JOBS@EXAMPLE.COM', 'MALE', '9273654830', 'RADIOLOGY', 2010, 'ADVANCED RADIOLOGY', '4TH FLOOR', 2024-2010, 130, TO_DATE('1985-02-24', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC020', 'DR. TINA FEY', 'TINA.FEY@EXAMPLE.COM', 'FEMALE', '8372645189', 'GASTROENTEROLOGY', 2006, 'GASTRO HEALTH CENTER', 'SUITE 410', 2024-2006, 165, TO_DATE('1979-05-18', 'YYYY-MM-DD'));

-- Additional entries to complete 20 entries --

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC021', 'DR. URIEL WIND', 'URIEL.WIND@EXAMPLE.COM', 'MALE', '6728394510', 'UROLOGY', 2009, 'URO CARE CLINIC', '5TH FLOOR', 2024-2009, 140, TO_DATE('1983-09-14', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC022', 'DR. VICTOR STROME', 'VICTOR.STROME@EXAMPLE.COM', 'MALE', '5387261490', 'HEMATOLOGY', 1999, 'BLOOD HEALTH INSTITUTE', '6TH FLOOR', 2024-1999, 230, TO_DATE('1971-11-30', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC023', 'DR. WILLOW HUNT', 'WILLOW.HUNT@EXAMPLE.COM', 'FEMALE', '4958273610', 'PATHOLOGY', 2002, 'PATH CARE LABS', 'GROUND LEVEL', 2024-2002, 200, TO_DATE('1975-12-20', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC024', 'DR. XAVIER GONG', 'XAVIER.GONG@EXAMPLE.COM', 'MALE', '7285946130', 'NEPHROLOGY', 2011, 'KIDNEY CARE CENTER', '2ND LEVEL', 2024-2011, 120, TO_DATE('1986-07-07', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC025', 'DR. YASMINE FLOWER', 'YASMINE.FLOWER@EXAMPLE.COM', 'FEMALE', '8173629450', 'ENDOCRINOLOGY', 2008, 'HORMONE HEALTH', '3RD FLOOR', 2024-2008, 150, TO_DATE('1982-04-25', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC026', 'DR. ZACHARY SUN', 'ZACHARY.SUN@EXAMPLE.COM', 'MALE', '6182739451', 'PULMONOLOGY', 2007, 'BREATH WELL CLINIC', 'TOP FLOOR', 2024-2007, 160, TO_DATE('1980-10-15', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC027', 'DR. AMELIA POND', 'AMELIA.POND@EXAMPLE.COM', 'FEMALE', '9038172645', 'ORTHOPEDICS', 2014, 'BONE & JOINT CENTER', 'SUITE 102', 2024-2014, 90, TO_DATE('1988-01-11', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC028', 'DR. BRUCE BANNER', 'BRUCE.BANNER@EXAMPLE.COM', 'MALE', '8192637456', 'PSYCHIATRY', 2016, 'MENTAL HEALTH CENTER', '1ST FLOOR', 2024-2016, 75, TO_DATE('1990-12-24', 'YYYY-MM-DD'));

INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, experience, total_operations, date_of_birth)
VALUES ('BMDC029', 'DR. CHARLOTTE WEB', 'CHARLOTTE.WEB@EXAMPLE.COM', 'FEMALE', '7125639487', 'GENERAL SURGERY', 2004, 'GENERAL HOSPITAL', 'SURGERY UNIT', 2024-2004, 180, TO_DATE('1972-06-30', 'YYYY-MM-DD'));


commit;
CREATE TABLE products (
    productId NUMBER PRIMARY KEY,
    product_name VARCHAR2(255) NOT NULL,
    price NUMBER NOT NULL,
    stock NUMBER NOT NULL,
    image VARCHAR2(255) NOT NULL
);
alter table products add ctgr varchar(255);

-- Insert Maternity Products
INSERT INTO Products (productId, product_name, price, stock, image, ctgr) VALUES
(1, 'Pregnancy Pillow', 500, 10, '/assets/pregnancypillow.jpeg', 'Maternity products');

INSERT INTO Products (productId, product_name, price, stock, image, ctgr) VALUES
(2, 'Maternity Dress', 1200, 5, '/assets/maternity_dress.jpg', 'Maternity products');

INSERT INTO Products (productId, product_name, price, stock, image, ctgr) VALUES
(3, 'Stretch Mark Oil', 750, 20, '/assets/stretch_mark_oil.jpg', 'Maternity products');

INSERT INTO Products (productId, product_name, price, stock, image, ctgr) VALUES
(4, 'Maternity Top', 850, 15, '/assets/maternity_top.jpg', 'Maternity products');

INSERT INTO Products (productId, product_name, price, stock, image, ctgr) VALUES
(5, 'Prenatal Vitamins', 650, 25, '/assets/prenatal_vitamins.jpg', 'Maternity products');

INSERT INTO Products (productId, product_name, price, stock, image, ctgr) VALUES
(6, 'Maternity Essentials', 1500, 30, '/assets/maternity_essentials.jpg', 'Maternity products');

-- Insert Baby Products & Toys
INSERT INTO Products (productId, product_name, price, stock, image, ctgr) VALUES
(7, 'Baby Wipes', 350, 50, '/assets/baby_wipes.jpg', 'Baby products & toys');

INSERT INTO Products (productId, product_name, price, stock, image, ctgr) VALUES
(8, 'Diapers', 450, 40, '/assets/diaper.jpg', 'Baby products & toys');

INSERT INTO Products (productId, product_name, price, stock, image, ctgr) VALUES
(9, 'Baby Shoes', 300, 15, '/assets/shoes.jpg', 'Baby products & toys');

INSERT INTO Products (productId, product_name, price, stock, image, ctgr) VALUES
(10, 'Baby Clothes', 400, 10, '/assets/onesie.jpg', 'Baby products & toys');

INSERT INTO Products (productId, product_name, price, stock, image, ctgr) VALUES
(11, 'Teether', 250, 20, '/assets/teether.jpg', 'Baby products & toys');

INSERT INTO Products (productId, product_name, price, stock, image, ctgr) VALUES
(12, 'Babys Hanging Toy', 550, 30, '/assets/hanging_toy.jpg', 'Baby products & toys');

INSERT INTO Admin (admin_id, name, email, hashed_password, phone_no)
VALUES (2, 'JOHN DOE', 'JOHN.DOE@EXAMPLE.COM', 'plaintext', '1234567890');

CREATE TABLE doctor_images (
    image_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    BMDC VARCHAR(255) NOT NULL,
    filename VARCHAR2(255) NOT NULL,
    mime_type VARCHAR2(100) NOT NULL,
    image_data BLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk__image_bmdc FOREIGN KEY (BMDC) REFERENCES Doctors(BMDC)
);
SELECT MAX(PRODUCTID) AS maxId FROM products;

CREATE TABLE Feedbacks (
    feedback_id INT DEFAULT FEEDBACK_SEQ.NEXTVAL , 
    des clob,
    rate INT,
    user_id INT,
    doctor_id VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(userid),
    FOREIGN KEY (doctor_id) REFERENCES Doctors(BMDC)
);

CREATE SEQUENCE FEEDBACK_SEQ
START WITH 1
INCREMENT BY 1
NOCYCLE;
/
COMMIT;