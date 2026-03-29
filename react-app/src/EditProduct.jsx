import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
        sizes: "",
        colors: "",
        active: true,
        images: []

    });

    const [loading, setLoading] = useState(true);

    const [uploading, setUploading] = useState(false);


    /* load product */

    useEffect(() => {

        fetch(`http://localhost:8080/api/products/${id}`)

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

                    sizes: data.sizes?.join(",") || "",

                    colors: data.colors?.join(",") || "",

                    active: data.active,

                    images: data.images?.length

                        ? data.images

                        : data.imageUrl

                            ? [data.imageUrl]

                            : []

                });

                setLoading(false);

            });

    }, [id]);


    function handleChange(e) {

        const { name, value, type, checked } = e.target;

        setForm({

            ...form,

            [name]: type === "checkbox"

                ? checked

                : value

        });

    }


    /* upload image */

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

            images: [...f.images, json.secure_url]

        }));

        setUploading(false);

    }


    /* drag reorder */

    function dragStart(index) {

        return e => {

            e.dataTransfer.setData("index", index);

        };

    }


    function dropImage(index) {

        return e => {

            e.preventDefault();

            const fromIndex = e.dataTransfer.getData("index");

            const updated = [...form.images];

            const moved = updated.splice(fromIndex, 1)[0];

            updated.splice(index, 0, moved);

            setForm({

                ...form,

                images: updated

            });

        };

    }


    function removeImage(index) {

        setForm(f => ({

            ...f,

            images: f.images.filter((_, i) => i !== index)

        }));

    }


    /* save */

    function saveProduct(e) {

        e.preventDefault();

        fetch(

            `http://localhost:8080/api/products/${id}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    name: form.name,

                    slug: form.slug,

                    price: Number(form.price),

                    discountPrice: form.discountPrice

                        ? Number(form.discountPrice)

                        : null,

                    stock: Number(form.stock),

                    category: form.category,

                    description: form.description,

                    active: form.active,

                    sizes: form.sizes

                        ? form.sizes.split(",")

                        : [],

                    colors: form.colors

                        ? form.colors.split(",")

                        : [],

                    imageUrl: form.images[0],

                    images: form.images

                })

            }

        )

            .then(() => {

                alert("updated");

                navigate("/products");

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

                        placeholder="Original Price"

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

                        name="sizes"

                        value={form.sizes}

                        onChange={handleChange}

                        placeholder="Sizes (S,M,L)"

                    />


                    <input

                        name="colors"

                        value={form.colors}

                        onChange={handleChange}

                        placeholder="Colors (Black,White)"

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

                            e => Array.from(

                                e.target.files

                            ).forEach(uploadImage)

                        }

                    />


                    {uploading && <p>uploading...</p>}


                    <div className="preview-row">

                        {form.images.map((img, i) => (

                            <div

                                key={i}

                                draggable

                                onDragStart={dragStart(i)}

                                onDrop={dropImage(i)}

                                onDragOver={(e) => e.preventDefault()}

                                className="preview-box"

                            >

                                <img

                                    src={img}

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