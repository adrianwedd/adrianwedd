const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { amount } = req.body;

        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `Terminal Coin (${amount} USD)`,
                            },
                            unit_amount: amount * 100, // amount in cents
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${req.headers.origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.headers.origin}/?payment=cancelled`,
            });

            res.status(200).json({ sessionId: session.id });
        } catch (error) {
            console.error('Error creating Stripe checkout session:', error);
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
};
