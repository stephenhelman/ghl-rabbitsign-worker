const clean = (fields) => {
  return fields.filter((f) => f.currentValue != null && f.currentValue !== "");
};

const contractMapper = {
  cash: (body, todayStr) =>
    clean([
      { name: "effectiveDate", currentValue: todayStr },
      { name: "sellerName", currentValue: body.customData.sellerName },
      { name: "buyerName", currentValue: body.customData.buyerName },
      {
        name: "propertyAddress",
        currentValue: body.customData.propertyAddress,
      },
      {
        name: "purchasePrice",
        currentValue: body.customData.purchasePrice,
      },
      {
        name: "earnestMoney",
        currentValue: body.customData.earnestMoney,
      },
      {
        name: "titleCompany",
        currentValue: body.customData.titleCompany,
      },
      {
        name: "optionPeriod",
        currentValue: body.customData.optionPeriod,
      },
      {
        name: "inspectionPeriod",
        currentValue: body.customData.optionPeriod,
      },
      {
        name: "closingDate",
        currentValue: body.customData.closingDate,
      },
      { name: "propertyState", currentValue: body.state },
      {
        name: "sellerPrint",
        currentValue: body.customData.sellerName,
      },
      { name: "buyerPrint", currentValue: body.customData.buyerName },
    ]),
  subjectTo: (body, todayStr) => clean([]),
  sellerFinance: (body, todayStr) => clean([]),
  novation: (body, todayStr) => clean([]),
  assignment: (body, todayStr) => clean([]),
};

export const buildSenderFieldValuesForType = (type, body, today) => {
  const key = String(type || "").toLowerCase();
  const mapper = contractMapper[key];

  if (!mapper) {
    throw new Error(`No contract mapper defined for type: ${type}`);
  }

  return mapper(body, today);
};

export const buildRoles = (body) => {
  return {
    Seller: {
      name: body.customData.sellerName,
      email: body.email,
    },
    Buyer: {
      name: body.customData.buyerName,
      email: body.user.email,
    },
  };
};
