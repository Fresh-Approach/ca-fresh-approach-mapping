function parseDistributions(distributionRecords) {
  const distributionHash = {};

  distributionRecords.forEach((dist) => {
    const date = new Date(dist.deliveryDate);
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}`;

    if (!distributionHash[dist.hub]) {
      distributionHash[dist.hub] = {};
    }

    if (!distributionHash[dist.hub][dist.distributionSite]) {
      distributionHash[dist.hub][dist.distributionSite] = {};
    }

    if (formattedDate) {
      const locationRelationship =
        distributionHash[dist.hub][dist.distributionSite];

      if (locationRelationship[formattedDate]) {
        locationRelationship[formattedDate].push(dist);
      } else {
        locationRelationship[formattedDate] = [dist];
      }

      locationRelationship.meta = {
        hub: dist.hub,
        hubId: dist.hubId,
        hubGeo: dist.hubGeo,
        womanOwned: dist.womanOwned,
        bipocOwned: dist.bipocOwned,
        schoolSite: dist.schoolSite,
        foodBankPartner: dist.foodBankPartner,
        certifiedOrganic: dist.certifiedOrganic,
        distributionSite: dist.distributionSite,
        distributionSiteId: dist.distributionSiteId,
        distributionSiteGeo: dist.distributionSiteGeo,
      };
    }
  });

  const parsedRecords = [];
  Object.values(distributionHash).forEach((distributionSites) => {
    Object.values(distributionSites).forEach(({ meta, ...months }) => {
      parsedRecords.push({
        ...meta,
        months,
      });
    });
  });

  return parsedRecords;
}

exports.parseDistributions = parseDistributions;
