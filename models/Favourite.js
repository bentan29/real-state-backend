import mongoose from "mongoose";

const FavouriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            propertyId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Property',
                required: true
            }
        }
    ]
}, {timestamps:true})

export const Favourite = mongoose.model('Favourite', FavouriteSchema);