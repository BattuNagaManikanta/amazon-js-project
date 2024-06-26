import { cart, removeFromCart,updateQuantity,updateDeliverOption,calculateCartQuantity} from "../../data/cart.js";
import { getProduct, products } from "../../data/products.js";
import {formatCurrency} from "../utils/money.js";
import { deliveryOptions, getDeliveryOption } from "../../data/deliveryOptions.js";
import dayJS from 'https://unpkg.com/dayjs@1.11.10/esm/index.js'
import { renderPaymentSummary } from "./paymentSummary.js";

export function renderOrderSummary(){

  let cartSummaryHTML="";
  cart.forEach((cartItem)=>{
      const productId=cartItem.productId
      let matchingProduct=getProduct(productId);
        const deliveryOptionId=cartItem.deliveryOptionId;
        let deliveryOption=getDeliveryOption(deliveryOptionId);
        const today= dayJS();
        const deliveryDate=today.add(deliveryOption.deliveryDays,'days');
        const dateString=deliveryDate.format(
          'dddd, MMMM D'
        )
    
    
      cartSummaryHTML+=`
      <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
              <div class="delivery-date">
                Delivery date: ${dateString}
              </div>

              <div class="cart-item-details-grid">
                <img class="product-image"
                  src="${matchingProduct.image}">

                <div class="cart-item-details">
                  <div class="product-name">
                    ${matchingProduct.name}
                  </div>
                  <div class="product-price">
                    $${formatCurrency(matchingProduct.priceCents)}
                  </div>
                  <div class="product-quantity">
                    <span>
                      Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}">${cartItem.quantity}</span>
                    </span>
                    <span class="update-quantity-link link-primary js-update-quantity-link" data-product-id=${matchingProduct.id}>
                      Update
                    </span>
                    <input class="quantity-input js-quantity-input-${matchingProduct.id}">
                    <span class="save-quantity-link link-primary js-save-quantity-link" data-product-id=${matchingProduct.id}>Save</span>
                    <span class="delete-quantity-link link-primary js-delete-link" data-product-id=${matchingProduct.id}>
                      Delete
                    </span>
                  </div>
                </div>

                <div class="delivery-options">
                  <div class="delivery-options-title">
                    Choose a delivery option:
                  </div>
                  ${deliveryOptionsHTML(cartItem,matchingProduct)}
                </div>
              </div>
            </div>`
      
  });
  document.querySelector('.js-order-summary').innerHTML=cartSummaryHTML;

  function deliveryOptionsHTML(cartItem,matchingProduct){
    
    
    let html='';
    deliveryOptions.forEach((deliveryOption)=>{
      const today= dayJS();
      const deliveryDate=today.add(deliveryOption.deliveryDays,'days');
      const dateString=deliveryDate.format(
        'dddd, MMMM D'
      )
      const isChecked=deliveryOption.id === cartItem.deliveryOptionId;
      console.log(isChecked);
      html+=`
      <div class="delivery-option js-delivery-option"
      data-product-id=${matchingProduct.id}
      data-delivery-option-id=${deliveryOption.id}
      >
          <input type="radio" ${ isChecked ? 'checked' : ''}
              class="delivery-option-input"
              name="delivery-option-${matchingProduct.id}">
          <div>
              <div class="delivery-option-date">
                  ${dateString}
              </div>
              <div class="delivery-option-price">
                  ${deliveryOption.priceCents === 0 ? 'FREE': '$' + formatCurrency(deliveryOption.priceCents)} Shipping
              </div>
            </div>
      </div>
      `
    })
    return html;
  }



  document.querySelectorAll('.js-delete-link').forEach((link)=>{
      link.addEventListener("click",()=>{
          const productId=link.dataset.productId;
          removeFromCart(productId);     
          const container=document.querySelector(`.js-cart-item-container-${productId}`);
          container.remove();
          updateCartQuantity();
          renderPaymentSummary();
      });

  });


  function updateCartQuantity(){
    let cartQuantity= calculateCartQuantity();
    document.querySelector('.js-return-to-home-link')
      .innerHTML = `${cartQuantity} items`;
  }
  updateCartQuantity();


  document.querySelectorAll('.js-update-quantity-link').forEach((link)=>{
    link.addEventListener('click',()=>{
      const {productId}=link.dataset;
      const container=document.querySelector(`.js-cart-item-container-${productId}`);
      container.classList.add('is-editing-quantity')
    })
  })

  document.querySelectorAll('.js-save-quantity-link').forEach((saveLink)=>{
    saveLink.addEventListener('click',()=>{
    const {productId}=saveLink.dataset;
    const container=document.querySelector(`.js-cart-item-container-${productId}`);
    container.classList.remove('is-editing-quantity');
    const quantityInput=document.querySelector(
      `.js-quantity-input-${productId}` 
    ).value;
    const newQuantity=Number(quantityInput)
    updateQuantity(productId, newQuantity);
    const quantityLabel=document.querySelector(`.js-quantity-label-${productId}`)
    quantityLabel.innerHTML=newQuantity;
    updateCartQuantity();
    })
  })

  document.querySelectorAll('.js-delivery-option').forEach((element)=>{
    console.log(element);
    element.addEventListener('click',()=>{
      const {productId,deliveryOptionId}=element.dataset;
      updateDeliverOption(productId,deliveryOptionId)
      renderOrderSummary();
      renderPaymentSummary();
    })

  })
}