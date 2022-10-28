import React, { useEffect } from "react";
import { TelegramClient } from "messaging-api-telegram";
import { useForm } from "react-hook-form";
import axios from "axios";

const zipyApi = "https://www.zipy.co.il/api/product/getPromoProducts";
const webUrl =
  "https://www.zipy.co.il/p/%D7%90%D7%9C%D7%99%D7%90%D7%A7%D7%A1%D7%A4%D7%A8%D7%A1/";

async function sendAds({ accessToken, userName, limit, chatId }) {
  const client = new TelegramClient({ accessToken });
  const res = await axios.get(zipyApi, {
    params: { shopIds: ["aliexpress"], limit },
  });
  let products = res.data.result.map((product) => {
    return {
      ...product,
      url:
        webUrl +
        product.name.toLowerCase().split(" ").join("-").split(",")[0] +
        "/" +
        product.id +
        "#" +
        userName,
    };
  });
  const messages = products.map((product) => {
    return {
      image: product.image,
      msg:
        "\n\n\nשם:    " +
        product.name +
        "\n\nמחיר:    " +
        product.price.value +
        product.price.icon +
        "\n\nבמקום:   " +
        product.notDiscountedPrice.value +
        product.notDiscountedPrice.icon +
        "\n\nהנחה:   " +
        product.discount +
        "%" +
        "\n\nדירוג:    " +
        product.reviewsAverage +
        "\n\nתגובות:    " +
        product.reviewsTotal,
      url: product.url,
    };
  });
  try {
    Promise.all(
      messages.map((m) =>
        client
          .sendPhoto(chatId, m.image, {
            caption: m.msg,
            disableNotification: true,
            replyMarkup: {
              inlineKeyboard: [[{ text: "👈  קישור למוצר  👉", url: m.url }]],
            },
          })
          .catch((e) => console.log(e.message))
      )
    );
    alert("Done!");
  } catch (e) {
    console.log(e);
  }
}

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <div className="d-flex justify-content-center mx-auto mt-3 my-2">
      <form
        className="mx-auto"
        style={{
          margin: "0",
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
        }}
        onSubmit={handleSubmit(sendAds)}
      >
        <img
          src="store-front.png"
          alt="no image"
          width={"200vw"}
          // height={"150vw"}
        />
        <div className="card-body">
          <input
            type="text"
            placeholder="accessToken"
            {...register("accessToken", { required: "required" })}
          />
          {errors.accessToken && (
            <p className="form-text text-danger">
              {" "}
              {errors.accessToken.message}{" "}
            </p>
          )}
        </div>
        <div className="card-body">
          <input
            type="text"
            name="userName"
            placeholder="User Name"
            {...register("userName", { required: "required" })}
          />
          {errors.userName && (
            <p className="form-text text-danger"> {errors.userName.message} </p>
          )}
        </div>
        <div className="card-body">
          <input
            name="chatId"
            type="text"
            placeholder="Chat ID"
            {...register("chatId", { required: "required" })}
          />
          {errors.chatId && (
            <p className="form-text text-danger"> {errors.chatId.message} </p>
          )}
        </div>
        <div className="card-body">
          <input
            type="number"
            name="limit"
            min="1"
            max="24"
            placeholder="Amount Of Ads"
            {...register("limit", { required: "required" })}
          />
          {errors.limit && (
            <p className="form-text text-danger"> {errors.limit.message} </p>
          )}
        </div>
        <div className="d-flex justify-content-center my-2">
          <button type="submit" className="btn btn-secondary">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
