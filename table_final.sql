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


CREATE TABLE Doctors (
    BMDC VARCHAR(100) NOT NULL,
    fullname VARCHAR2(255) NOT NULL,
    email VARCHAR2(255) NOT NULL,
    gender VARCHAR2(10),
    phone VARCHAR2(15),
    dept VARCHAR2(100),
    mbbsYear VARCHAR2(4) NOT NULL,
    hosp VARCHAR2(255),
    chamber VARCHAR2(255),
    experience number,
    total_operations number,
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
// Calorie Tracker needs two tables.

CREATE TYPE nutrition_facts AS OBJECT (
    calories DECIMAL(5, 2),
    protein DECIMAL(5, 2),
    carbohydrates DECIMAL(5, 2),
    fat DECIMAL(5, 2),
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

INSERT INTO Shop (productId, product_name, price, stock, image)
VALUES
(1, 'Pregnancy Pillow', 130.00, 1, '/assets/pregnancypillow.jpeg'),
(2, 'Vitamins', 150.00, 1, '/assets/prenatal_vitamins.jpg'),
(3, 'Diapers', 200.00, 1, '/assets/diaper.png'),
(4, 'Baby Wipes', 80.00, 1, '/assets/baby_wipes.jpg'),
(5, 'Maternity Dresses', 300.00, 1, '/assets/maternity_dress.png');


CREATE TABLE Places (
    user_id INT,
    order_item_id INT,
    date DATE,
    quantity INT,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (order_item_id) REFERENCES Order_Item(order_item_id)
);



CREATE TABLE Admin (
    admin_id INT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    phone_no VARCHAR(255)
);

CREATE TABLE Feedback (
    feedback_id INT PRIMARY KEY,
    description VARCHAR(255),
    rate INT,
    user_id INT,
    doctor_id INT,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (doctor_id) REFERENCES Doctor(BMDC_no)
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

commit;

