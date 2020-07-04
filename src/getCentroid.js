/** @module src/getCentroid */
import proj4 from 'proj4'
import km100s from './km100'
import projections from './projections'

/**
 * Given a grid reference (British National Grid, Irish Grid or UTM zone 30N shorthand),
 * and a two-letter code defining the requested output projection, this function
 * returns the centroid of the grid reference. If an invalid grid reference is supplied
 * and error will be thrown indicating the problem.
 * @param {string} gr - the grid reference
 * @param {string} toProjection - two letter code specifying the required output CRS.
 * @returns {object} - of the form {centroid: [x, y], proj: 'code'}; x and y are 
 * coordinates in CRS specified by toProjection. The proj code indicates the source projection.
 * @todo Expand to deal with grid references of all precisions 
 * (currently - 01/07/2020 only deals with hectads and 100 km grs).
 */
export function getCentroid (gr, toProjection) {

  const match = gr.match(/^[A-Za-z]+/)
  if (!match) throw("Bad GR - doesn't start with letters")
      
  const prefix = match[0].toUpperCase()
  const km100 = km100s[prefix]
  if (!km100) throw("Bad GR - unrecognised prefix")

  let x, y, outCoords
  if (prefix === gr.toUpperCase()) {
    // The GR is a 100 km square reference
    x = km100.x * 100000 + 50000
    y = km100.y * 100000 + 50000
  } else if (gr.length - prefix.length === 2) {
    // The GR is a hectad
    const kEasting = Number(gr.substr(prefix.length,1))
    const kNorthing = Number(gr.substr(prefix.length+1,1))
    x = km100.x * 100000 + kEasting * 10000 + 5000
    y = km100.y * 100000 + kNorthing * 10000 + 5000
  } else {
    throw("This GR type not dealt with yet")
  }

  // If the required output projection does not match the projection of the 100 km square
  // then use proj4 to reproject
  if (toProjection !== km100.proj)  {
    outCoords = proj4(projections[km100.proj].proj4, projections[toProjection].proj4, [x, y])
  } else {
    outCoords = [x, y]
  }
  return {
    centroid: outCoords,
    proj: km100.proj
  }
}
