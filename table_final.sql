CREATE SEQUENCE user_id_seq
    START WITH 1
    INCREMENT BY 1
    NOMAXVALUE;

CREATE OR REPLACE TYPE Address_Type AS OBJECT (
    Street   VARCHAR2(100),
    Region   VARCHAR2(50),
    District VARCHAR2(50),
    Country  VARCHAR2(50)
);
/

CREATE TABLE Users (
    userid NUMBER DEFAULT user_id_seq.NEXTVAL NOT NULL,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    fullname VARCHAR2(255) GENERATED ALWAYS AS (firstname || ' ' || lastname),
    email VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    blood_group VARCHAR(5),
    phone_number VARCHAR(16),
    address Address_Type,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_USERID PRIMARY KEY (userid)
);


ALTER TABLE USERS 
ADD CONSTRAINT CHK_PHONE CHECK (LENGTH(PHONE_NUMBER) BETWEEN 11 AND 16);

--WARNING HERE NEW ADDITIONS!!!~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
--new additions
ALTER TABLE Users
ADD age NUMBER;

CREATE OR REPLACE PROCEDURE UpdateUserAges IS
BEGIN
    UPDATE Users
    SET age = FLOOR(MONTHS_BETWEEN(SYSDATE, date_of_birth) / 12)
    WHERE date_of_birth IS NOT NULL;
    
    COMMIT;
END UpdateUserAges;
/

CREATE OR REPLACE VIEW MedicalHistoryView AS
SELECT m.user_id, m.year AS incident_year, m.incident, m.treatment,
       u.firstname, u.lastname, u.date_of_birth,
       (m.year - EXTRACT(YEAR FROM u.date_of_birth)) AS age_of_incident
FROM Medical_History m
JOIN Users u ON m.user_id = u.userid;

CREATE OR REPLACE PROCEDURE CalculateExperience (p_bmdc IN Doctors.BMDC%TYPE) IS
    v_current_year NUMBER;
    v_mbbs_year NUMBER;
    v_experience NUMBER;
BEGIN
    SELECT EXTRACT(YEAR FROM SYSDATE) INTO v_current_year FROM dual;
    SELECT TO_NUMBER(mbbsYear) INTO v_mbbs_year FROM Doctors WHERE BMDC = p_bmdc;

    v_experience := v_current_year - v_mbbs_year - 1;
    
    -- Correcting negative experience
    IF v_experience < 1 THEN
        v_experience := 0;
    END IF;

    -- Updating the doctor's experience
    UPDATE Doctors
    SET experience = v_experience
    WHERE BMDC = p_bmdc;
    
    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No such doctor found with BMDC: ' || p_bmdc);
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('An error occurred: ' || SQLERRM);
        ROLLBACK;
END CalculateExperience;

CREATE TABLE user_images (
    image_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    filename VARCHAR2(255) NOT NULL,
    mime_type VARCHAR2(100) NOT NULL,
    image_data BLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES Users(userid)
);
CREATE TABLE doctor_images (
    image_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    BMDC VARCHAR(255) NOT NULL,
    filename VARCHAR2(255) NOT NULL,
    mime_type VARCHAR2(100) NOT NULL,
    image_data BLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk__image_bmdc FOREIGN KEY (BMDC) REFERENCES Doctors(BMDC)
);
--new additions end up to above~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

CREATE TABLE Doctors (
    BMDC VARCHAR(100) NOT NULL,
    fullname VARCHAR2(255) NOT NULL,
    email VARCHAR2(255) NOT NULL,
    gender VARCHAR2(10),
    phone VARCHAR2(15),
    dept VARCHAR2(100),
    mbbsYear NUMBER NOT NULL,
    hosp VARCHAR2(255),
    chamber VARCHAR2(255),
    experience NUMBER,
    total_operations NUMBER,
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_BMDC PRIMARY KEY (BMDC)
);


CREATE TABLE Passwords (
    userid NUMBER ,
    hashed_password VARCHAR(255),
    BMDC VARCHAR(100),
    CONSTRAINT FK_USERID FOREIGN KEY (userid) REFERENCES Users(userid) ON DELETE CASCADE,
    CONSTRAINT FK_BMDC FOREIGN KEY (BMDC) REFERENCES Doctors(BMDC) ON DELETE CASCADE
);

/**
 The above are the modifications done on user table. run it sequentially.
 */

CREATE TABLE Medical_History (
    user_id INT,
    year INT,
    incident VARCHAR(255),
    treatment VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(userid)
);
// Medicine Tracker er shob 
create table medicine (
medicine_code int,
medicine_name varchar2(100)
);

CREATE TABLE medicinetracker (
    medicine_code INT,
    user_id INT,
    id NUMBER NOT NULL,
    name VARCHAR2(100),
    dosage VARCHAR2(50),
    time VARCHAR2(50),
    FOREIGN KEY (user_id) REFERENCES Users(userid)
);

CREATE SEQUENCE medicine_seq
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;
    

CREATE OR REPLACE TRIGGER medicine_trigger
BEFORE INSERT ON medicinetracker
FOR EACH ROW
BEGIN
    SELECT medicine_seq.NEXTVAL INTO :new.id FROM dual;
END;
//
--beshi error dile ei duita // baad diye run korish. Amar eitay error dichilo.
ALTER TRIGGER C##ZAFIRA.MEDICINE_TRIGGER COMPILE; 
--change made by reefah up
CREATE TABLE Appointment (
    appointment_id INT PRIMARY KEY,
    BMDC_no INT,
    date DATE,
    time TIME,
    day VARCHAR(255),
    FOREIGN KEY (BMDC_no) REFERENCES Doctor(BMDC_no)
);
CREATE TABLE Books (
    booking_id INT PRIMARY KEY,
    user_id INT,
    appointment_id INT,
    date DATE,
    time TIME,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id)
);
--Calorie Tracker needs two tables.

CREATE TYPE nutrition_facts AS OBJECT (
    calories DECIMAL(5, 2),
    protein DECIMAL(5, 2),
    carbohydrates DECIMAL(5, 2),
    fat DECIMAL(5, 2)
);

Create table foodlist (
food_name varchar2(250),
nutrition_details nutrition_facts
);
INSERT INTO foodlist (food_name, nutrition_details)
VALUES ('Apple', nutrition_facts(52.00, 0.26, 13.81, 0.17));

CREATE TABLE Calorietracker (
    food_item VARCHAR2(255),
    user_id INT,
    serving INT,
    calories INT,
    meal_type VARCHAR2(255),
    entry_date DATE,  -- Renamed to 'entry_date' to avoid confusion with reserved keywords
    entry_time TIMESTAMP,  -- Changed from TIME to TIMESTAMP
    FOREIGN KEY (user_id) REFERENCES Users(userid)
);


CREATE TABLE products (
    productId NUMBER PRIMARY KEY,
    product_name VARCHAR2(255) NOT NULL,
    price NUMBER NOT NULL,
    stock NUMBER NOT NULL,
    image VARCHAR2(255) NOT NULL
);
alter table products add ctgr varchar(255);


INSERT INTO Products (productId, product_name, price, stock, image, ctgr)
VALUES
(1, 'Pregnancy Pillow', 130.00, 1, '/assets/pregnancypillow.jpeg', 'Maternity'),
(2, 'Vitamins', 150.00, 1, '/assets/prenatal_vitamins.jpg', 'Maternity'),
(3, 'Diapers', 200.00, 1, '/assets/diaper.png', 'Baby'),
(4, 'Baby Wipes', 80.00, 1, '/assets/baby_wipes.jpg', 'Baby'),
(5, 'Maternity Dresses', 300.00, 1, '/assets/maternity_dress.png', 'clothes');





CREATE TABLE Admin (
    admin_id INT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    hashed_password varchar(255),
    phone_no VARCHAR(255)
);

CREATE TABLE Feedback (
    feedback_id INT PRIMARY KEY,
    description VARCHAR(255),
    rate INT,
    user_id INT,
    doctor_id VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (doctor_id) REFERENCES Doctors(BMDC)
);

CREATE TABLE cart (
  productid NUMBER,
  user_id NUMBER,
  title VARCHAR2(255),
  price NUMBER,
  image VARCHAR2(255),
  quantity NUMBER,
  PRIMARY KEY (productid, user_id)
);
CREATE TABLE orders (
  user_id NUMBER,
  order_id VARCHAR2(255),
  productid NUMBER,
  title VARCHAR2(255),
  price NUMBER,
  image VARCHAR2(255),
  quantity NUMBER

);

CREATE TABLE Places (
    user_id INT,
    order_id INT,
    date_t DATE,
    bill NUMBER
);

commit;

