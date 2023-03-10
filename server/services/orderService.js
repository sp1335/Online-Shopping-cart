const { Pool } = require('pg');
const connectionCredits = {
    user: 'postgres',
    host: 'localhost',
    database: 'zbd-app',
    password: '1111',
    port: 5432
}
async function fetchOrderitems(id) {
    const client = await pool.connect()
    const fetchQuery = `SELECT * FROM orderitem WHERE order_orderid = ${id} ORDER BY orderitemid`;
    return await client.query(fetchQuery)
}
const pool = new Pool(connectionCredits)
class OrderService {

    async deleteFromCart(req, res) {
        const client = await pool.connect()
    }
    async changeQuantInCart(req, res) {
        const client = await pool.connect()
        const { action, item } = req.body.params
        let query = ''
        if (action === 1) {
            query = `UPDATE public.orderitem SET quantity = quantity - 1 WHERE orderitemid = ${item}`
        } else if (action === 2) {
            query = `UPDATE public.orderitem SET quantity = quantity + 1 WHERE orderitemid = ${item}`;
        } else {
            res.status(500).json('Forbidden action')
        }
        try {
            await client.query(query)
            const newArray = (await fetchOrderitems(item)).rows
            res.status(200).json(newArray)
        } catch (error) {
            res.status(500).json(error)
        } finally {
            client.release()
        }
    }
    async getOrders(req, res) {
        const client = await pool.connect();
        try {
            const { status } = req.query;
            const userId = req.params.userId;
            let fetchQuery = '';
            if (status === 'unpayed') {
                fetchQuery = `SELECT * FROM "order" WHERE user_userid = ${userId} AND paymentstate = false`;
            } else if (status === 'payed') {
                fetchQuery = `SELECT * FROM "order" WHERE user_userid = ${userId} AND paymentstate = true`;
            } else {
                fetchQuery = `SELECT * FROM "order" WHERE user_userid = ${userId}`;
            }
            let fetchedOrders
            if (status === 'unpayed') {
                fetchedOrders = (await client.query(fetchQuery)).rows[0]
                if (fetchedOrders) {
                    const orderid = fetchedOrders.orderid
                    const fetchItemsQuery = `SELECT * FROM orderitem WHERE order_orderid = ${orderid} ORDER BY orderitemid`
                    const orderItems = await client.query(fetchItemsQuery)
                    res.status(200).json(orderItems.rows)
                } else {
                    res.status(404).json({ response: 'No unpayed orders found' })
                }
            } else {
                fetchedOrders = (await client.query(fetchQuery)).rows
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: "Error fetching orders" })
        }
        client.release()
    }


}
module.exports = new OrderService();