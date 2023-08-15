export async function reqFormParser(req: Request) {
  const formData = await req.formData()
  const raw = Object.fromEntries(formData.entries())
  return formParser(raw)
}

export function formParser(obj: Record<string, string | File>) {
  const result: Record<string, any> = {};

  const isTopLevelArray = Object.keys(obj).every(key => !isNaN(Number(key)));
  if (isTopLevelArray) {
    return Object.keys(obj).map(key => obj[key]);
  }

  for (const key in obj) {
    const parts = key.split(/\]\[|\[|\]/).filter(Boolean);
    let current = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (i === parts.length - 1) {
        current[part] = obj[key];
      } else {
        if (!isNaN(Number(parts[i + 1]))) {
          current[part] = current[part] || [];
        } else {
          current[part] = current[part] || {};
        }
        current = current[part];
      }
    }
  }

  return result;
}

// export function formParser(obj: Record<string, string | File>) {
//   const result: Record<string, any> = {};

//   for (const key in obj) {
//     const parts = key.split(/\]\[|\[|\]/).filter(Boolean);
//     let current = result;

//     for (let i = 0; i < parts.length; i++) {
//       const part = parts[i];

//       if (i === parts.length - 1) {
//         current[part] = obj[key];
//       } else {
//         if (!isNaN(Number(parts[i + 1]))) {
//           current[part] = current[part] || [];
//         } else {
//           current[part] = current[part] || {};
//         }
//         current = current[part];
//       }
//     }
//   }

//   return result;
// }

// export function formParser(obj: Record<string, string | File>) {
//   const result: Record<string, any> = {};
//   for (const key in obj) {
//     const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
//     const objectMatch = key.match(/^(\w+)\[(\d+)\]\[(.+)\]$/);

//     if (arrayMatch) {
//       const prefix = arrayMatch[1];
//       const index = parseInt(arrayMatch[2], 10);
//       result[prefix] = result[prefix] || [];
//       result[prefix][index] = obj[key];
//     } else if (objectMatch) {
//       const prefix = objectMatch[1];
//       const index = parseInt(objectMatch[2], 10);
//       const prop = objectMatch[3];
//       result[prefix] = result[prefix] || [];
//       result[prefix][index] = result[prefix][index] || {}
//       result[prefix][index][prop] = obj[key];
//     } else {
//       result[key] = obj[key];
//     }
//   }
//   return result;
// }
