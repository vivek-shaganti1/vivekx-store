import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "./config";

const CLOUD_NAME = "dgpxnwfaq";
const UPLOAD_PRESET = "vivekx_products";

function EditProduct() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({

        name: "",
        slug: "",
        price: "",
        discountPrice: "",
        stock: "",
        category: "Watch",
        description: "",

        sizesText: "",
        colorsText: "",

        images: [],
        productCode: "",

        active: true

    });

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);


    /* LOAD PRODUCT */

    useEffect(() => {

        fetch(`${API_BASE_URL}/api/products/${id}`)

            .then(res => res.json())

            .then(data => {

                setForm({

                    name: data.name || "",
                    slug: data.slug || "",
                    price: data.price || "",
                    discountPrice: data.discountPrice || "",
                    stock: data.stock || "",
                    category: data.category || "Watch",
                    description: data.description || "",

                    sizesText:
                        data.sizes?.length
                            ? data.sizes.map(s => s.size).join(",")
                            : "",

                    colorsText:
                        data.colors?.length
                            ? data.colors.map(c => c.color).join(",")
                            : "",

                    images:
                        data.images?.length
                            ? data.images
                            : data.imageUrl
                                ? [{ image: data.imageUrl }]
                                : [],

                    productCode: data.productCode || null,

                    active: data.active ?? true

                });

                setLoading(false);

            });

    }, [id]);


    /* INPUT CHANGE */

    function handleChange(e) {

        const { name, value, type, checked } = e.target;

        setForm({

            ...form,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        });

    }


    /* CLOUDINARY UPLOAD */

    async function uploadImage(file) {

        setUploading(true);

        const data = new FormData();

        data.append("file", file);
        data.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(

            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

            {
                method: "POST",
                body: data
            }

        );

        const json = await res.json();

        setForm(f => ({

            ...f,

            images: [...f.images, { image: json.secure_url }]

        }));

        setUploading(false);

    }


    /* REMOVE IMAGE */

    function removeImage(index) {

        setForm({

            ...form,

            images: form.images.filter((_, i) => i !== index)

        });

    }


    /* SAVE */

    function saveProduct(e) {

        e.preventDefault();

        const payload = {

            id: Number(id),

            name: form.name || "",
            slug: form.slug || "",

            price: Number(form.price) || 0,

            discountPrice:
                form.discountPrice
                    ? Number(form.discountPrice)
                    : null,

            stock: Number(form.stock) || 0,

            category: form.category || "Watch",

            description: form.description || "",

            active: form.active ?? true,

            productCode: form.productCode || null,


            /* NEVER NULL */
            sizes:
                form.sizesText && form.sizesText.trim() !== ""
                    ? form.sizesText.split(",").map(s => ({
                        size: s.trim()
                    }))
                    : [],


            colors:
                form.colorsText && form.colorsText.trim() !== ""
                    ? form.colorsText.split(",").map(c => ({
                        color: c.trim()
                    }))
                    : [],


            /* IMAGES SAFE */
            images:

                Array.isArray(form.images)

                    ? form.images.map(img => {

                        if (typeof img === "object") {

                            if (img.id) {

                                return {
                                    id: img.id,
                                    image: img.image
                                };

                            }

                            return {
                                image: img.image
                            };

                        }

                        return {
                            image: img
                        };

                    })

                    : [],


            /* STRING ONLY */
            imageUrl:

                form.images?.length

                    ? (
                        typeof form.images[0] === "object"
                            ? form.images[0].image
                            : form.images[0]
                    )

                    : null

        };


        fetch(`${API_BASE_URL}/api/products/${id}`, {

            method: "PUT",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(payload)

        })

            .then(res => {

                if (!res.ok) {

                    console.log("PAYLOAD SENT", payload);

                    throw new Error("Update failed");

                }

                return res.json();

            })

            .then(() => {

                alert("Product updated successfully ✅");

                navigate("/products");

            })

            .catch(err => {

                console.error(err);

                alert("Still error — send payload screenshot");

            });

    }

    if (loading) return <p>loading...</p>;


    return (

        <div className="add-product-page">

            <div className="glass add-product-card">

                <h2 className="gold-text">

                    Edit Product

                </h2>


                <form onSubmit={saveProduct}>

                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Product Name"
                    />


                    <input
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="Price"
                    />


                    <input
                        name="discountPrice"
                        value={form.discountPrice}
                        onChange={handleChange}
                        placeholder="Discount Price"
                    />


                    <input
                        name="stock"
                        type="number"
                        value={form.stock}
                        onChange={handleChange}
                        placeholder="Stock"
                    />


                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                    >

                        <option value="Watch">Watch</option>
                        <option value="Shoes">Shoes</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Accessories">Accessories</option>

                    </select>


                    <input
                        name="sizesText"
                        value={form.sizesText}
                        onChange={handleChange}
                        placeholder="Sizes S,M,L"
                    />


                    <input
                        name="colorsText"
                        value={form.colorsText}
                        onChange={handleChange}
                        placeholder="Colors Black,White"
                    />


                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Description"
                    />


                    <label>

                        <input
                            type="checkbox"
                            name="active"
                            checked={form.active}
                            onChange={handleChange}
                        />

                        Active product

                    </label>


                    <input
                        type="file"
                        multiple
                        onChange={
                            e =>
                                Array.from(e.target.files)
                                    .forEach(uploadImage)
                        }
                    />


                    {uploading && <p>uploading...</p>}


                    <div className="preview-row">

                        {form.images.map((img, i) => (

                            <div
                                key={i}
                                className="preview-box"
                            >

                                <img
                                    src={
                                        typeof img === "object"
                                            ? img.image
                                            : img
                                    }
                                    className="preview-img"
                                />


                                <button
                                    type="button"
                                    className="img-delete-btn"
                                    onClick={() => removeImage(i)}
                                >

                                    ✕

                                </button>

                            </div>

                        ))}

                    </div>


                    <button className="lux-btn">

                        Save Changes

                    </button>


                </form>

            </div>

        </div>

    );

}

export default EditProduct;