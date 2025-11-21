export const mapGhlToCtx = (ghlPayload, type) => {
  const customData = ghlPayload.customData; // all data custom to a deal
  const userData = ghlPayload.userData;

  return {
    contractType: type,
    opportunityId: ghlPayload.id,
    seller: {
      ghlContactId: ghlPayload.contact_id,
      fullName: ghlPayload.full_name,
      email: ghlPayload.email,
      phone: ghlPayload.phone,
    },

    // Buyer may be optional for some flows
    buyer: {
      fullName: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      phone: userData.phone,
    },

    property: {
      propertyAddress: ghlPayload.address1,
      propertyCity: ghlPayload.city,
      propertyState: ghlPayload.state,
      propertyZip: ghlPayload.postal_code,
    },

    deal: {
      purchasePrice: customData.purchasePrice,
      earnestMoney: customData.earnestMoney,
      titleCompany: customData.titleCompany,
      optionPeriod: customData.optionPeriod,
      inspectionPeriod: customData.inspectionPeriod || customData.optionPeriod,
      closingDate: customData.closingDate,
    },
  };
};
