const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the CORS package

const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(cors());
app.use(bodyParser.json());

// Oracle DB Connection Configuration
const dbConfig = {
  user: 'zaima',
  password: 'zaima',
  connectString: 'localhost:1521/ORCL'
};

Fetch Products from Oracle DB
app.get('/api/products', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(`
      DECLARE
        cur SYS_REFCURSOR;
        v_productid NUMBER;
        v_product_name VARCHAR2(100);
        v_price NUMBER;
        v_stock NUMBER;
        v_image VARCHAR2(200);
        v_ctgr VARCHAR2(50);
      BEGIN
        OPEN cur FOR 
          SELECT PRODUCTID, PRODUCT_NAME, PRICE, STOCK, IMAGE, CTGR 
          FROM products;
        :1 := cur;
      END;
    `, {
      outFormat: oracledb.OBJECT, 
      resultSet: true
    });

    const resultSet = result.outBinds[0];
    const rows = [];
    let row;
    
    // Fetch rows from the result set
    while ((row = await resultSet.getRow())) {
      rows.push(row);
    }

    // Close the resultSet cursor
    await resultSet.close();

    res.json(rows); // Send fetched rows as the response
  } catch (err) {
    console.error(err);
    res.status(500).send('Database Error');
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});


// Add product to cart
app.post('/api/cart', async (req, res) => {
  const { productId, title, price, quantity, userid } = req.body;
  console.log(userid);
  console.log(req.body);
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      'INSERT INTO cart (productid, title, price, quantity) VALUES (:productId, :title, :price, :quantity)',
      { productId, title, price, quantity },
      { autoCommit: true }
    );
    res.status(201).json({ message: 'Product added to cart successfully' });
  } catch (err) {
    console.error('Error inserting into the cart table:', err);
    res.status(500).json({ error: 'Error inserting into the cart table' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Fetch Cart Data
app.put('/api/cart/:id', async (req, res) => {
  const productId = req.params.id;
  const { change } = req.body;
  const { userId } = req.body;  // Expecting userId in the request body

  console.log(productId, change, userId);  // Optional logging for debugging

  let conn;

  try {
    // Establish a connection
    conn = await connection();

    // Execute the update query with both productId and userId
    const result = await conn.execute(
      'UPDATE cart SET quantity = quantity + :change WHERE productid = :productId AND user_id = :userId',
      { change, productId, userId },
      { autoCommit: true }
    );

    // Check if any rows were affected (i.e., if the product exists in the cart for the user)
    if (result.rowsAffected === 0) {
      res.status(404).json({ error: 'Product not found in user\'s cart' });
    } else {
      res.status(200).json({ message: 'Product quantity updated successfully' });
    }
  } catch (err) {
    console.error('Error updating product quantity:', err);
    res.status(500).json({ error: 'Error updating product quantity' });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error('Error closing the connection:', err);
      }
    }
  }
});


// Remove Product from Cart
app.delete('/api/cart/:id', async (req, res) => {
  const productId = req.params.id;

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      'DELETE FROM cart WHERE productid = :productId',
      { productId },
      { autoCommit: true }
    );
    res.status(200).json({ message: 'Product removed from cart successfully' });
  } catch (err) {
    console.error('Error removing product from the cart table:', err);
    res.status(500).json({ error: 'Error removing product from the cart table' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Update Product Quantity in Cart
app.put('/api/cart/:id', async (req, res) => {
  const productId = req.params.id;
  const { change } = req.body;

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      'UPDATE cart SET quantity = quantity + :change WHERE productid = :productId',
      { change, productId },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      res.status(404).json({ error: 'Product not found in cart' });
    } else {
      res.status(200).json({ message: 'Product quantity updated successfully' });
    }
  } catch (err) {
    console.error('Error updating product quantity:', err);
    res.status(500).json({ error: 'Error updating product quantity' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

async function generateUniqueOrderId(connection) {
  const min = 1000000000;
  const max = 9999999999;
  let unique = false;
  let orderId;

  while (!unique) {
      orderId = Math.floor(Math.random() * (max - min + 1)) + min;

      const result = await connection.execute(
          'SELECT count(*) FROM orders WHERE orderid = :orderId',
          { orderId },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows[0]['COUNT(*)'] === 0) {
          unique = true;
      }
  }
  return orderId;
}

app.post('/api/order', async (req, res) => {
  const { cartItems } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    const orderId = await generateUniqueOrderId(connection);  // Generate a unique Order ID

    for (const item of cartItems) {
      await connection.execute(
        'INSERT INTO orders (orderid, productid, title, price, quantity) VALUES (:orderId, :productId, :title, :price, :quantity)',
        { orderId, productId: item.productId, title: item.title, price: item.price, quantity: item.quantity },
        { autoCommit: false }
      );
    }

    await connection.commit();

    // Truncate the cart table
    await connection.execute('TRUNCATE TABLE cart', [], { autoCommit: true });
    
    res.json({ success: true, orderId: orderId, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error placing order:', error);
    await connection.rollback();
    res.status(500).json({ success: false, error: 'Failed to place order' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
