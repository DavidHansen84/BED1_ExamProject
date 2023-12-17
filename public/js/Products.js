async function deleteProduct(id) {
    let url = 'http://localhost:3000/products/delete/'
        await fetch(url + id, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
        })
    }).then((response) => {
        if (response.ok) {
            const resData = 'Deleted product';
            location.reload()
            return Promise.resolve(resData);
        }
        return Promise.reject(response);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });;
}

async function activateProduct(id) {
    let url = 'http://localhost:3000/products/activate/'
        await fetch(url + id, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
        })
    }).then((response) => {
        if (response.ok) {
            const resData = 'Activated product';
            location.reload()
            return Promise.resolve(resData);
        }
        return Promise.reject(response);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });;
}

async function editProduct(id, Name, ImageURL, Description, Price, Quantity, Brand, Category) {
    let url = 'http://localhost:3000/products/edit/'
        await fetch(url + id, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            Name: Name, 
            ImageURL: ImageURL, 
            Description: Description, 
            Price: Price, 
            Quantity: Quantity, 
            Brand: Brand, 
            Category: Category
        })
    }).then((response) => {
        if (response.ok) {
            const resData = 'Edited product';
            window.close();
            opener.location.reload()
            return Promise.resolve(resData);
        }
        const errorData = response.json();
        return Promise.reject(errorData);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });;
}

async function editButton(id) {
    let url = 'http://localhost:3000/admin/editProduct/'
    console.log(url)
        await fetch(url + id, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        }    
    }).then((response) => {
        if (response.ok) {
            const resData = 'Edit product page';
            window.open(url + id,'_blank', 'width=500px, height=500px')
            return Promise.resolve(resData);
        }
        return Promise.reject(response);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });;
}

async function addButton() {
    let url = 'http://localhost:3000/admin/addProduct'
        await fetch(url, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        }    
    }).then((response) => {
        if (response.ok) {
            const resData = 'Add product page';
            window.open(url,'_blank', 'width=500px, height=500px')
            return Promise.resolve(resData);
        }
        return Promise.reject(response);
    })
      .catch((response) => {
        alert(response.statusText);
      });;
}

async function addProduct(Name, ImageURL, Description, Price, Quantity, Brand, Category) {
    let url = 'http://localhost:3000/products/add/'
        await fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            Name: Name, 
            ImageURL: ImageURL, 
            Description: Description, 
            Price: Price, 
            Quantity: Quantity, 
            Brand: Brand, 
            Category: Category
        })
    }).then((response) => {
        if (response.ok) {
            const resData = 'Added product';
            window.close();
            opener.location.reload()
            return Promise.resolve(resData);
        }
        const errorData = response.json();
        return Promise.reject(errorData);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });
}

function search(productSearch, categorySearch, brandSearch) {
    const url = 'http://localhost:3000/search';
    const url2 = 'http://localhost:3000/admin/products/search';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            productSearch: productSearch,
            categorySearch: categorySearch,
            brandSearch: brandSearch
        })
    })
    .then((response) => {
        if (response.ok) {
            return response.json();
        }
        console.log("fail")
        return Promise.reject(response);
    })
    .then((jsonData) => {
        console.log(jsonData);
        
        // sadly had to get ChatGPT help here to send the info to the page. :/
        const url2WithParams = `${url2}?jsonData=${encodeURIComponent(JSON.stringify(jsonData))}`;
        window.location.href = url2WithParams;
        return Promise.resolve(jsonData);
    })
    .catch((response) => {
        console.log("failed")
        alert(response);
    });
}


// old code b4 chatGPT
// function search(productSearch, categorySearch, brandSearch) {
//     const url = 'http://localhost:3000/search';
//     const url2 = 'http://localhost:3000/admin/products/search';
// fetch(url, {
//     method: 'POST',
//     headers: {
//         'Content-type': 'application/json'
//     },
//     body: JSON.stringify({
//         productSearch: productSearch,
//         categorySearch: categorySearch,
//         brandSearch: brandSearch
//     })
// }).then((response) => {
//         if (response.ok) {
//             const resData = 'Products in Search';
//             alert(resData);
//             console.log(jsonData);
//             // window.location.href = url2;
//             return Promise.resolve(resData);
//         }
//         console.log("fail")
//         return Promise.reject(response);
//       })
//       .catch((response) => {
//         console.log("failed")
//         alert(response.statusText);
//       });
// }