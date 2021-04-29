// https://shopify.dev/docs/storefront-api/reference/common-objects/image
const fragmentImage = `
fragment FragmentImage on Image {
  width
  height
  originalSrc
  transformedSrc(preferredContentType: WEBP)
  altText
}
`
// https://shopify.dev/docs/storefront-api/reference/products/collection
const fragmentCollection = `
fragment FragmentCollection on Collection {
  id
  handle
  description
  title
}
`

// https://shopify.dev/docs/storefront-api/reference/products/product

const fragmentProduct = `
${fragmentCollection}
${fragmentImage}
fragment FragmentProduct on Product {
  id
  handle
  tags
  images(first: 8) {
    edges {
      node {
        ...FragmentImage
      }
    }
  }
  description
  priceRange {
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  collections(first: 8) {
    edges {
      node {
        ...FragmentCollection
      }
    }
  }
  title
}
`

const fragmentCollectionWithProducts = `
${fragmentProduct}
fragment FragmentCollectionWithProducts on Collection {
  ...FragmentCollection
  products(first: 10) {
    edges {
      node {
        ...FragmentProduct
      }
    }
  } 
}
`


// getStoreSettings() {

// }

// function getCategories() {}

// function categoriesByIds(ids) {}

// function getCategoryPath(id) {}

// function getProductCount() {}

// function getProducts() {}

// function getProductsById(){}

// function getProductById(productId){}

// function getProductBySlug(slug){}

// function getProductsByPath(path) {}

// function getProductsByCategory(id) {}

export default function initStorefrontApi(token, shopUrl, version='2021-04') {
  async function sendQuery(query) {
    console.log('dsq', shopUrl, token)
    const url = new URL(shopUrl)
    const graphQLQuery = `${url.origin}/api/${version}/graphql.json`
  
    return await fetch(graphQLQuery, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({
        query,
      }),
    })
      .then((res) => res.json())
      .then((res) => res.data)
  }
  
  async function getProducts(first = 50) {
    const productQuery = `
      ${fragmentProduct}
      {
        products(first: ${first}) {
          edges {
            node{
              ...FragmentProduct
            }
          }
        }
      }
      `
      return await sendQuery(productQuery)
  }
  async function getProduct() {
    const query = `
    {
      node(id: "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzgwOTI1NDg5OTg=") {
        id
        ... on Product {
          title
        }
      }
    }
    `
    return await sendQuery(query)
  }
  
  async function getProductBySlug(handle) {
    const query = `
    ${fragmentProduct}
    {
      productByHandle(handle: "${handle}") {
        ...FragmentProduct
      }
    }
    `
    return await sendQuery(query)
  }
  
  async function getProductsByCategory(handle) {
    const query = `
      ${fragmentCollectionWithProducts}
      {
        collectionByHandle(handle: "${handle}") {
          ...FragmentCollectionWithProducts
        }
      }
    `
  
    return await sendQuery(query)
  }
  return { sendQuery, getProducts, getProduct, getProductBySlug, getProductsByCategory }
}