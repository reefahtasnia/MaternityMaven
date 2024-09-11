select * from users;
select * from passwords;
select * from Medical_History;
select * from medicine;
select * from orders;
select * from cart;
select * from medicine;
select * from MEDICINETRACKER;

drop TRIGGER medicine_trigger;

CREATE OR REPLACE TRIGGER medicine_trigger
BEFORE INSERT ON medicinetracker
FOR EACH ROW
BEGIN
    SELECT medicine_seq.NEXTVAL INTO :new.id FROM dual;
END;

ALTER TRIGGER C##ZAFIRA.MEDICINE_TRIGGER COMPILE;

INSERT INTO medicine (medicine_code, medicine_name) VALUES (1, 'Paracetamol');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (2, 'Ibuprofen');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (3, 'Aspirin');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (4, 'Metformin');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (5, 'Amlodipine');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (6, 'Atorvastatin');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (7, 'Amoxicillin');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (8, 'Omeprazole');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (9, 'Levothyroxine');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (10, 'Ciprofloxacin');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (11, 'Losartan');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (12, 'Clopidogrel');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (13, 'Simvastatin');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (14, 'Cetrizine');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (15, 'Azithromycin');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (16, 'Furosemide');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (17, 'Gabapentin');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (18, 'Prednisolone');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (19, 'Hydrochlorothiazide');
INSERT INTO medicine (medicine_code, medicine_name) VALUES (20, 'Pantoprazole');

commit;
