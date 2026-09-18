```javascript
/* =========================================
   PROFESSIONAL PRODUCT DETAILS
========================================= */

let currentProduct = null;
let detailsQuantity = 1;
let currentImageIndex = 0;


/* OPEN PRODUCT DETAILS */

function openProductDetails(
  name,
  price,
  oldPrice,
  imageClass,
  description,
  sizes,
  colors,
  sizeId,
  colorId
) {

  currentProduct = {
    name: name,
    price: price,
    oldPrice: oldPrice,
    imageClass: imageClass,
    description: description,
    sizes: sizes,
    colors: colors,
    sizeId: sizeId,
    colorId: colorId
  };


  detailsQuantity = 1;
  currentImageIndex = 0;


  const detailsPage =
    document.getElementById("productDetails");

  if (!detailsPage) {
    return;
  }


  /* PRODUCT NAME */

  document.getElementById("detailsName").textContent =
    name;


  /* PRICE */

  document.getElementById("detailsPrice").textContent =
    price;


  document.getElementById("detailsOldPrice").textContent =
    "₹" + oldPrice;


  /* DESCRIPTION */

  document.getElementById("detailsDescription").textContent =
    description;


  /* MAIN IMAGE */

  setDetailsImage(imageClass);


  /* THUMBNAILS */

  for (let i = 0; i < 4; i++) {

    const thumb =
      document.getElementById("thumb" + i);

    if (thumb) {

      thumb.className =
        "thumb-image " + imageClass;

    }

  }


  /* SIZE OPTIONS */

  const sizeSelect =
    document.getElementById("detailsSize");

  sizeSelect.innerHTML =
    '<option value="">Select Size</option>';


  sizes.forEach(function(size) {

    const option =
      document.createElement("option");

    option.value = size;
    option.textContent = size;

    sizeSelect.appendChild(option);

  });


  /* COLOUR OPTIONS */

  const colorSelect =
    document.getElementById("detailsColor");

  colorSelect.innerHTML =
    '<option value="">Select Colour</option>';


  colors.forEach(function(color) {

    const option =
      document.createElement("option");

    option.value = color;
    option.textContent = color;

    colorSelect.appendChild(option);

  });


  /* QUANTITY */

  document.getElementById(
    "detailsQuantity"
  ).textContent = "1";


  /* SHOW PAGE */

  detailsPage.classList.add("active");

  document.body.classList.add(
    "details-open"
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* CHANGE MAIN IMAGE */

function changeProductImage(index) {

  if (!currentProduct) {
    return;
  }

  currentImageIndex = index;

  setDetailsImage(
    currentProduct.imageClass
  );


  document
    .querySelectorAll(".thumb")
    .forEach(function(thumb, i) {

      thumb.classList.toggle(
        "active",
        i === index
      );

    });

}


/* SET IMAGE */

function setDetailsImage(imageClass) {

  const mainImage =
    document.getElementById("detailsPic");

  if (!mainImage) {
    return;
  }

  mainImage.className =
    "details-pic " + imageClass;

}


/* CLOSE DETAILS */

function closeProductDetails() {

  const detailsPage =
    document.getElementById("productDetails");

  if (!detailsPage) {
    return;
  }

  detailsPage.classList.remove("active");

  document.body.classList.remove(
    "details-open"
  );

}


/* CHANGE QUANTITY */

function changeDetailsQuantity(amount) {

  detailsQuantity += amount;


  if (detailsQuantity < 1) {
    detailsQuantity = 1;
  }


  if (detailsQuantity > 10) {
    detailsQuantity = 10;
  }


  document.getElementById(
    "detailsQuantity"
  ).textContent = detailsQuantity;

}


/* ADD PRODUCT FROM DETAILS */

function addDetailsProduct(buyNow = false) {

  if (!currentProduct) {
    return;
  }


  const size =
    document.getElementById(
      "detailsSize"
    ).value;


  const color =
    document.getElementById(
      "detailsColor"
    ).value;


  if (size === "") {

    alert("Please select Size");

    return;

  }


  if (color === "") {

    alert("Please select Colour");

    return;

  }


  const existingItem =
    cart.find(function(item) {

      return (
        item.name === currentProduct.name &&
        item.size === size &&
        item.color === color
      );

    });


  if (existingItem) {

    existingItem.quantity +=
      detailsQuantity;

  } else {

    cart.push({

      name: currentProduct.name,

      price: currentProduct.price,

      size: size,

      color: color,

      quantity: detailsQuantity

    });

  }


  updateCart();


  alert(
    currentProduct.name +
    " cart me " +
    detailsQuantity +
    " item add ho gaya!"
  );


  closeProductDetails();


  if (buyNow) {

    setTimeout(function() {

      const orderBox =
        document.querySelector(".order-box");

      if (orderBox) {

        orderBox.scrollIntoView({
          behavior: "smooth"
        });

      }

    }, 300);

  }

}
```


