import type { Metadata, OpenGraphArticle, OpenGraphProfile } from "@/types";

export function generateMetadata(meta: Metadata) {
	const metas: React.DetailedHTMLProps<
		React.MetaHTMLAttributes<HTMLMetaElement>,
		HTMLMetaElement
	>[] = [];
	const links: React.DetailedHTMLProps<
		React.LinkHTMLAttributes<HTMLLinkElement>,
		HTMLLinkElement
	>[] = [];

	Object.entries(meta).forEach(([key, value]) => {
		switch (key as keyof Metadata) {
			case "charSet": {
				metas.push({ charSet: value as typeof meta.charSet });
				break;
			}
			case "viewport": {
				metas.push({
					name: "viewport",
					content: value as typeof meta.viewport,
				});
				break;
			}
			case "title":
				metas.push({ title: value as typeof meta.title });
				break;
			case "description":
				metas.push({
					name: "description",
					content: value as typeof meta.description,
				});
				break;
			case "keywords":
				metas.push({
					name: "keywords",
					content: (value as string[]).join(", "),
				});
				break;
			case "applicationName":
				metas.push({ name: "application-name", content: value as string });
				break;
			case "authors": {
				const authors = value as typeof meta.authors;
				authors?.forEach((author) => {
					metas.push({ name: "author", content: author.name });
					if (author.url) {
						links.push({ rel: "author", href: author.url.toString() });
					}
				});
				break;
			}
			case "generator":
				metas.push({ name: "generator", content: value as string });
				break;
			case "referrer":
				metas.push({ name: "referrer", content: value as string });
				break;
			case "creator":
				metas.push({ name: "creator", content: value as string });
				break;
			case "publisher":
				metas.push({ name: "publisher", content: value as string });
				break;
			case "icons":
				links.push({ rel: "icon", href: value as string });
				break;
			case "alternates": {
				const alternates = value as typeof meta.alternates;
				links.push({ rel: "canonical", href: alternates?.canonical || "" });
				if (alternates?.languages) {
					Object.entries(alternates.languages).forEach(([lang, url]) => {
						links.push({ rel: "alternate", hrefLang: lang, href: url || "" });
					});
				}
				break;
			}
			case "manifest":
				links.push({ rel: "manifest", href: value as string });
				break;
			case "abstract": {
				const abstract = (value as typeof meta.abstract) || "";
				metas.push({ name: key, content: abstract || "" });
				break;
			}
			case "archives": {
				const archives = (value as typeof meta.archives) || [];
				archives?.forEach((archive) => {
					links.push({ rel: key, href: archive });
				});
				break;
			}
			case "assets": {
				const assets = (value as typeof meta.assets) || [];
				assets?.forEach((asset) => {
					links.push({ rel: key, href: asset });
				});
				break;
			}
			case "bookmarks": {
				const bookmarks = (value as typeof meta.bookmarks) || [];
				bookmarks?.forEach((bookmark) => {
					links.push({ rel: key, href: bookmark });
				});
				break;
			}
			case "category": {
				metas.push({ name: key, content: value as typeof meta.category });
				break;
			}
			case "pagination": {
				const pagination = value as typeof meta.pagination;
				links.push(
					...[
						{ rel: "prev", href: pagination?.previous || "" },
						{ rel: "next", href: pagination?.next || "" },
					],
				);
				break;
			}
			case "classification": {
				metas.push({ name: key, content: value as typeof meta.classification });
				break;
			}
			case "openGraph": {
				const ogMetas = generateOpenGraphMetadata(
					value as typeof meta.openGraph,
				);
				metas.push(...ogMetas);
				break;
			}
			case "twitter": {
				const twitterMetas = generateOpenGraphTwitter(
					value as typeof meta.twitter,
				);
				metas.push(...twitterMetas);
				break;
			}
			case "facebook": {
				const facebookMetas = generateOpenGraphFacebook(
					value as typeof meta.facebook,
				);
				metas.push(...facebookMetas);
				break;
			}
			case "robots": {
				const robots = value as typeof meta.robots;
				metas.push({ name: key, content: robots || "" });
				break;
			}
			case "other": {
				const otherMetas = value as typeof meta.other;
				if (!otherMetas) break;
				Object.entries(otherMetas).forEach(([metaName, content]) => {
					metas.push({ name: metaName, content: content.toString() });
				});
				break;
			}
			default:
		}
	});

	return { metas, links };
}

function generateOpenGraphMetadata(openGraph: Metadata["openGraph"]) {
	const ogMetas: React.DetailedHTMLProps<
		React.MetaHTMLAttributes<HTMLMetaElement>,
		HTMLMetaElement
	>[] = [];
	if (!openGraph) return ogMetas;

	Object.entries(openGraph).forEach(([key, value]) => {
		switch (key as keyof typeof openGraph) {
			case "title": {
				ogMetas.push({ property: "og:title", content: value as string });
				break;
			}
			case "description": {
				ogMetas.push({ property: "og:description", content: value as string });
				break;
			}
			case "url": {
				ogMetas.push({ property: "og:url", content: value as string });
				break;
			}
			case "siteName": {
				ogMetas.push({ property: "og:site_name", content: value as string });
				break;
			}
			case "images": {
				const images = value as typeof openGraph.images;
				if (typeof images === "string") {
					ogMetas.push({ property: "og:image", content: images });
					break;
				}
				if (Array.isArray(images)) {
					images?.forEach((image) => {
						if (typeof image === "string") {
							ogMetas.push({ property: "og:image", content: image });
						} else {
							ogMetas.push({
								property: "og:image",
								content: image.url.toString(),
							});
							if (image.alt) {
								ogMetas.push({ property: "og:image:alt", content: image.alt });
							}
							if (image.width) {
								ogMetas.push({
									property: "og:image:width",
									content: image.width.toString(),
								});
							}
							if (image.height) {
								ogMetas.push({
									property: "og:image:height",
									content: image.height.toString(),
								});
							}
							if (image.type) {
								ogMetas.push({
									property: "og:image:type",
									content: image.type,
								});
							}
							if (image.secureUrl) {
								ogMetas.push({
									property: "og:image:secure_url",
									content: image.secureUrl.toString(),
								});
							}
						}
					});
					break;
				}
				break;
			}
			case "emails": {
				const emails = value as typeof openGraph.emails;
				if (typeof emails === "string") {
					ogMetas.push({ property: "og:email", content: emails });
					break;
				}
				emails?.forEach((email) => {
					ogMetas.push({ property: "og:email", content: email });
				});
				break;
			}
			case "countryName": {
				const countryName = value as typeof openGraph.countryName;
				ogMetas.push({ property: "og:country_name", content: countryName });
				break;
			}
			case "determiner": {
				const determiner = value as typeof openGraph.determiner;
				ogMetas.push({ property: "og:determiner", content: determiner });
				break;
			}
			case "locale": {
				const locale = value as typeof openGraph.locale;
				ogMetas.push({ property: "og:locale", content: locale });
				break;
			}
			case "alternateLocale": {
				const alternateLocales = value as typeof openGraph.alternateLocale;
				if (typeof alternateLocales === "string") {
					ogMetas.push({
						property: "og:locale:alternate",
						content: alternateLocales,
					});
					break;
				}
				alternateLocales?.forEach((altLocale) => {
					ogMetas.push({ property: "og:locale:alternate", content: altLocale });
				});
				break;
			}
			case "phoneNumbers": {
				const phoneNumbers = value as typeof openGraph.phoneNumbers;
				if (typeof phoneNumbers === "string") {
					ogMetas.push({ property: "og:phone_number", content: phoneNumbers });
					break;
				}
				phoneNumbers?.forEach((phoneNumber) => {
					ogMetas.push({ property: "og:phone_number", content: phoneNumber });
				});
				break;
			}
			case "faxNumbers": {
				const faxNumbers = value as typeof openGraph.faxNumbers;
				if (typeof faxNumbers === "string") {
					ogMetas.push({ property: "og:fax_number", content: faxNumbers });
					break;
				}
				faxNumbers?.forEach((faxNumber) => {
					ogMetas.push({ property: "og:fax_number", content: faxNumber });
				});
				break;
			}
			case "ttl": {
				const ttl = value as typeof openGraph.ttl;
				ogMetas.push({ property: "og:ttl", content: ttl?.toString() || "" });
				break;
			}
			case "audio": {
				const audio = value as typeof openGraph.audio;
				if (typeof audio === "string" || audio instanceof URL) {
					ogMetas.push({ property: "og:audio", content: audio.toString() });
					break;
				}
				if (Array.isArray(audio)) {
					audio?.forEach((a) => {
						if (typeof a === "string" || a instanceof URL) {
							ogMetas.push({ property: "og:audio", content: a.toString() });
						} else {
							ogMetas.push({
								property: "og:audio",
								content: a.url.toString(),
							});
							if (a.type) {
								ogMetas.push({
									property: "og:audio:type",
									content: a.type,
								});
							}
							if (a.secureUrl) {
								ogMetas.push({
									property: "og:audio:secure_url",
									content: a.secureUrl.toString(),
								});
							}
						}
					});
					break;
				}
				break;
			}
			case "videos": {
				const videos = value as typeof openGraph.videos;
				if (typeof videos === "string" || videos instanceof URL) {
					ogMetas.push({ property: "og:video", content: videos.toString() });
					break;
				}
				if (Array.isArray(videos)) {
					videos?.forEach((v) => {
						if (typeof v === "string" || v instanceof URL) {
							ogMetas.push({ property: "og:video", content: v.toString() });
						} else {
							ogMetas.push({
								property: "og:video",
								content: v.url.toString(),
							});
							if (v.type) {
								ogMetas.push({
									property: "og:video:type",
									content: v.type,
								});
							}
							if (v.secureUrl) {
								ogMetas.push({
									property: "og:video:secure_url",
									content: v.secureUrl.toString(),
								});
							}
							if (v.width) {
								ogMetas.push({
									property: "og:video:width",
									content: v.width.toString(),
								});
							}
							if (v.height) {
								ogMetas.push({
									property: "og:video:height",
									content: v.height.toString(),
								});
							}
						}
					});
					break;
				}
				break;
			}
			case "type": {
				const ogType = (value as typeof openGraph.type) || "";
				ogMetas.push({ property: "og:type", content: ogType });
				if (ogType === "article") {
					ogMetas.push(
						...generateOGArticleMetadata(openGraph as OpenGraphArticle),
					);
				}
				if (ogType === "profile") {
					ogMetas.push(
						...generateProfileMetadata(openGraph as OpenGraphProfile),
					);
				}
				break;
			}
			default:
		}
	});

	return ogMetas;
}

function generateOGArticleMetadata(meta: OpenGraphArticle) {
	const ogArticleMetas: React.DetailedHTMLProps<
		React.MetaHTMLAttributes<HTMLMetaElement>,
		HTMLMetaElement
	>[] = [];

	if (meta.publishedTime) {
		ogArticleMetas.push({
			property: "article:published_time",
			content: meta.publishedTime,
		});
	}
	if (meta.modifiedTime) {
		ogArticleMetas.push({
			property: "article:modified_time",
			content: meta.modifiedTime,
		});
	}
	if (meta.expirationTime) {
		ogArticleMetas.push({
			property: "article:expiration_time",
			content: meta.expirationTime,
		});
	}
	if (meta.authors) {
		if (typeof meta.authors === "string" || meta.authors instanceof URL) {
			ogArticleMetas.push({
				property: "article:author",
				content: meta.authors.toString(),
			});
		} else {
			meta.authors?.forEach((author) => {
				ogArticleMetas.push({
					property: "article:author",
					content: author.toString(),
				});
			});
		}
	}
	if (meta.section) {
		ogArticleMetas.push({ property: "article:section", content: meta.section });
	}
	if (meta.tags) {
		if (typeof meta.tags === "string") {
			ogArticleMetas.push({ property: "article:tag", content: meta.tags });
		} else {
			meta.tags.forEach((tag) => {
				ogArticleMetas.push({ property: "article:tag", content: tag });
			});
		}
	}

	return ogArticleMetas;
}

function generateProfileMetadata(meta: OpenGraphProfile) {
	const ogProfileMetas: React.DetailedHTMLProps<
		React.MetaHTMLAttributes<HTMLMetaElement>,
		HTMLMetaElement
	>[] = [];

	if (meta.firstName) {
		ogProfileMetas.push({
			property: "profile:first_name",
			content: meta.firstName,
		});
	}
	if (meta.lastName) {
		ogProfileMetas.push({
			property: "profile:last_name",
			content: meta.lastName,
		});
	}
	if (meta.username) {
		ogProfileMetas.push({
			property: "profile:username",
			content: meta.username,
		});
	}
	if (meta.gender) {
		ogProfileMetas.push({
			property: "profile:gender",
			content: meta.gender,
		});
	}

	return ogProfileMetas;
}

function generateOpenGraphTwitter(twitter: Metadata["twitter"]) {
	const twitterMetas: React.DetailedHTMLProps<
		React.MetaHTMLAttributes<HTMLMetaElement>,
		HTMLMetaElement
	>[] = [];
	if (!twitter) return twitterMetas;

	Object.entries(twitter).forEach(([key, value]) => {
		switch (key as keyof typeof twitter) {
			case "card": {
				twitterMetas.push({ name: "twitter:card", content: value as string });
				break;
			}
			case "title": {
				twitterMetas.push({ name: "twitter:title", content: value as string });
				break;
			}
			case "description": {
				twitterMetas.push({
					name: "twitter:description",
					content: value as string,
				});
				break;
			}
			case "images": {
				const images = value as typeof twitter.images;
				if (!images) break;
				if (typeof images === "string" || images instanceof URL) {
					twitterMetas.push({
						name: "twitter:image",
						content: images.toString(),
					});
					break;
				}
				if (Array.isArray(images)) {
					images.forEach((image) => {
						if (typeof image === "string" || image instanceof URL) {
							twitterMetas.push({
								name: "twitter:image",
								content: image.toString(),
							});
						} else {
							twitterMetas.push({
								name: "twitter:image",
								content: image.url.toString(),
							});
							if (image.alt) {
								twitterMetas.push({
									name: "twitter:image:alt",
									content: image.alt,
								});
							}
							if (image.width) {
								twitterMetas.push({
									name: "twitter:image:width",
									content: image.width.toString(),
								});
							}
							if (image.height) {
								twitterMetas.push({
									name: "twitter:image:height",
									content: image.height.toString(),
								});
							}
							if (image.type) {
								twitterMetas.push({
									name: "twitter:image:type",
									content: image.type,
								});
							}
							if (image.secureUrl) {
								twitterMetas.push({
									name: "twitter:image:secure_url",
									content: image.secureUrl.toString(),
								});
							}
						}
					});
					break;
				}

				twitterMetas.push({
					name: "twitter:image",
					content: images.url.toString(),
				});
				if (images.alt) {
					twitterMetas.push({ name: "twitter:image:alt", content: images.alt });
				}
				if (images.width) {
					twitterMetas.push({
						name: "twitter:image:width",
						content: images.width.toString(),
					});
				}
				if (images.height) {
					twitterMetas.push({
						name: "twitter:image:height",
						content: images.height.toString(),
					});
				}
				if (images.type) {
					twitterMetas.push({
						name: "twitter:image:type",
						content: images.type,
					});
				}
				if (images.secureUrl) {
					twitterMetas.push({
						name: "twitter:image:secure_url",
						content: images.secureUrl.toString(),
					});
				}
				break;
			}
			case "site": {
				twitterMetas.push({ name: "twitter:site", content: value as string });
				break;
			}
			case "siteId": {
				twitterMetas.push({
					name: "twitter:site:id",
					content: value as string,
				});
				break;
			}
			case "creator": {
				twitterMetas.push({
					name: "twitter:creator",
					content: value as string,
				});
				break;
			}
			case "creatorId": {
				twitterMetas.push({
					name: "twitter:creator:id",
					content: value as string,
				});
				break;
			}
			default:
		}
	});

	return twitterMetas;
}

function generateOpenGraphFacebook(facebook: Metadata["facebook"]) {
	const facebookMetas: React.DetailedHTMLProps<
		React.MetaHTMLAttributes<HTMLMetaElement>,
		HTMLMetaElement
	>[] = [];
	if (!facebook) return facebookMetas;

	Object.entries(facebook).forEach(([key, value]) => {
		switch (key as keyof typeof facebook) {
			case "appId": {
				facebookMetas.push({ property: "fb:app_id", content: value as string });
				break;
			}
			case "admins": {
				const admins = value as typeof facebook.admins;
				if (typeof admins === "string") {
					facebookMetas.push({ property: "fb:admins", content: admins });
					break;
				}
				admins?.forEach((admin) => {
					facebookMetas.push({ property: "fb:admins", content: admin });
				});
				break;
			}
			default:
		}
	});

	return facebookMetas;
}
