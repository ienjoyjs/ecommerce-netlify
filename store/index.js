import axios from "axios";
import data from "~/static/storedata.json";

export const state = () => ({
  cartUIStatus: "idle",
  storedata: data,
  cart: [],
  clientSecret: "" // Required to initiate the payment from the client
});

export const getters = {
  featuredProducts: state => state.storedata.slice(0, 3),
  women: state => state.storedata.filter(el => el.gender === "Female"),
  men: state => state.storedata.filter(el => el.gender === "Male"),
  cartCount: state => {
    if (!state.cart.length) return 0;
    return state.cart.reduce((ac, next) => ac + next.quantity, 0);
  },
  cartTotal: state => {
    if (!state.cart.length) return 0;
    return state.cart.reduce((ac, next) => ac + next.quantity * next.price, 0);
  },
  cartItems: state => {
    if (!state.cart.length) return [];
    return state.cart.map(item => {
      return {
        id: item.id,
        quantity: item.quantity
      };
    });
  },
  clientSecret: state => state.clientSecret
};

export const mutations = {
  updateCartUI: (state, payload) => {
    state.cartUIStatus = payload;
  },
  clearCart: state => {
    //this clears the cart
    (state.cart = []), (state.cartUIStatus = "idle");
  },
  addToCart: (state, payload) => {
    let itemfound = state.cart.find(el => el.id === payload.id);
    itemfound
      ? (itemfound.quantity += payload.quantity)
      : state.cart.push(payload);
  },
  setClientSecret: (state, payload) => {
    state.clientSecret = payload;
  }
};

export const actions = {
  async createPaymentIntent({ getters, commit }) {
    try {
      // Create a PaymentIntent with the information about the order
      const result = await axios.post(
        "https://wizardly-sinoussi-7841d1.netlify.com/.netlify/functions/create-payment-intent",
        {
          items: getters.cartItems
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (result.data.clientSecret) {
        // Store a reference to the client secret created by the PaymentIntent
        // This secret will be used to finalize the payment from the client
        commit("setClientSecret", result.data.clientSecret);
      }
    } catch (e) {
      console.log("error", e);
    }
  }
};
