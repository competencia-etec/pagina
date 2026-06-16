from sqlalchemy.orm import Session
from backend.models.user import User, OAuthAccount


def get_or_create_oauth_user(db: Session, profile: dict):
    # 1. Check if OAuth account exists
    oauth_acc = db.query(OAuthAccount).filter_by(
        provider=profile["provider"],
        provider_account_id=profile["id"]
    ).first()

    if oauth_acc:
        return oauth_acc.user

    # 2. If not, check if User exists by email
    user = db.query(User).filter(User.email == profile["email"]).first()

    # 3. Create user if they don't exist at all
    if not user:
        user = User(email=profile["email"])
        db.add(user)
        db.commit()
        db.refresh(user)

    # 4. Link the new OAuth account to the user
    new_oauth = OAuthAccount(
        user_id=user.id,
        provider=profile["provider"],
        provider_account_id=profile["id"]
    )
    db.add(new_oauth)
    db.commit()

    return user
